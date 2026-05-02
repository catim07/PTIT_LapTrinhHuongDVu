import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const dataFile = path.join(__dirname, 'mockData.json');

// CORS: allow frontend dev origins
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Set Cross-Origin headers for Google Identity Services compatibility
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(express.json({ limit: '10mb' }));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^.{8,}$/;

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const readDb = () => {
  const rawData = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(rawData);
};

const writeDb = (db) => {
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
};

const toPublicUser = (user) => {
  const safeUser = { ...user };
  delete safeUser.password;
  delete safeUser.password_hash;
  return safeUser;
};

const createAuthToken = (user) => {
  return Buffer.from(
    JSON.stringify({
      user_id: user.id,
      role_id: user.role_id,
      iat: Date.now(),
    })
  ).toString('base64');
};

const parseAuthToken = (token) => {
  if (!token) return null;

  if (token.startsWith('mockHeader')) {
    const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString('utf8');
    const parsed = JSON.parse(payloadStr);
    return parsed.userId || null;
  }

  const payloadStr = Buffer.from(token, 'base64').toString('utf8');
  const parsed = JSON.parse(payloadStr);
  return parsed.user_id || null;
};

const ensureSocialProvider = (user, provider, providerUserId) => {
  if (!Array.isArray(user.social_providers)) {
    user.social_providers = [];
  }

  const index = user.social_providers.findIndex((item) => item.provider === provider);
  if (index >= 0) {
    user.social_providers[index].provider_user_id = providerUserId;
  } else {
    user.social_providers.push({ provider, provider_user_id: providerUserId });
  }

  if (!user.social_links || typeof user.social_links !== 'object') {
    user.social_links = { facebook: null, google: null };
  }

  if (provider === 'google') {
    user.social_links.google = providerUserId;
    user.googleId = providerUserId;
  }
  if (provider === 'facebook') {
    user.social_links.facebook = providerUserId;
    user.facebookId = providerUserId;
  }
};

const findUserByEmail = (users, email) => {
  const normalized = normalizeEmail(email);
  return users.find((user) => normalizeEmail(user.email) === normalized);
};

const findUserByProviderId = (users, provider, providerUserId) => {
  if (!providerUserId) return undefined;

  return users.find((user) => {
    if (provider === 'google') {
      if (user.googleId === providerUserId) return true;
      if (user.social_links?.google === providerUserId) return true;
    }

    if (provider === 'facebook') {
      if (user.facebookId === providerUserId) return true;
      if (user.social_links?.facebook === providerUserId) return true;
    }

    return (user.social_providers || []).some(
      (item) => item.provider === provider && item.provider_user_id === providerUserId
    );
  });
};

const verifyGoogleCredential = async (credential) => {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!response.ok) {
    throw { status: 401, message: 'Google token không hợp lệ hoặc đã hết hạn' };
  }

  const tokenInfo = await response.json();

  if (tokenInfo?.error) {
    throw { status: 401, message: 'Google token không hợp lệ hoặc đã hết hạn' };
  }

  const expectedAudience = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (expectedAudience && tokenInfo.aud !== expectedAudience) {
    throw { status: 401, message: 'Google token không khớp client ID' };
  }

  const expSeconds = Number(tokenInfo.exp || 0);
  if (expSeconds && Date.now() >= expSeconds * 1000) {
    throw { status: 401, message: 'Google token đã hết hạn' };
  }

  const email = normalizeEmail(tokenInfo.email || '');
  if (!email) {
    throw { status: 400, message: 'Google account không cung cấp email' };
  }

  if (!tokenInfo.sub) {
    throw { status: 401, message: 'Google token thiếu định danh tài khoản' };
  }

  return {
    email,
    name: tokenInfo.name || tokenInfo.given_name || email.split('@')[0],
    picture: tokenInfo.picture || null,
    providerUserId: tokenInfo.sub,
  };
};

const verifyFacebookAccessToken = async (accessToken) => {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`
  );

  if (!response.ok) {
    throw { status: 401, message: 'Facebook token không hợp lệ hoặc đã hết hạn' };
  }

  const profile = await response.json();
  if (profile?.error) {
    throw { status: 401, message: 'Facebook token không hợp lệ hoặc đã hết hạn' };
  }

  const email = normalizeEmail(profile.email || '');
  if (!email) {
    throw { status: 400, message: 'Facebook account không cung cấp email' };
  }

  if (!profile.id) {
    throw { status: 401, message: 'Facebook token thiếu định danh tài khoản' };
  }

  return {
    email,
    name: profile.name || email.split('@')[0],
    picture: profile.picture?.data?.url || null,
    providerUserId: profile.id,
  };
};

const createNewUserFromSocial = (db, profile, provider) => {
  const users = db.users || [];
  const maxId = users.reduce((max, user) => Math.max(max, Number(user.id) || 0), 0);
  const now = new Date().toISOString();

  const user = {
    id: maxId + 1,
    username: profile.name,
    full_name: profile.name,
    email: profile.email,
    phone: '',
    avatar: profile.picture,
    role_id: 3,
    branch_id: null,
    lotte_points: 0,
    membership_level: 'Đồng',
    signup_method: provider,
    social_providers: [],
    status: 'ACTIVE',
    is_active: true,
    email_verified: true,
    password: null,
    password_hash: null,
    social_links: { facebook: null, google: null },
    preferences: {
      newsletter: true,
      sms_alerts: true,
      language: 'vi',
      receive_promotions: true,
    },
    created_at: now,
    updated_at: now,
    last_login_at: now,
  };

  ensureSocialProvider(user, provider, profile.providerUserId);
  db.users.push(user);
  return user;
};

const resolveSocialLogin = (db, profile, provider) => {
  let userByProvider = findUserByProviderId(db.users, provider, profile.providerUserId);
  const userByEmail = findUserByEmail(db.users, profile.email);

  if (userByProvider && userByEmail && userByProvider.id !== userByEmail.id) {
    throw {
      status: 409,
      message: 'Email này đã được liên kết với tài khoản khác. Vui lòng liên hệ hỗ trợ.',
    };
  }

  if (userByProvider) {
    userByProvider.email = profile.email;
    userByProvider.full_name = userByProvider.full_name || profile.name;
    userByProvider.username = userByProvider.username || profile.name;
    userByProvider.avatar = userByProvider.avatar || profile.picture;
    ensureSocialProvider(userByProvider, provider, profile.providerUserId);
    userByProvider.last_login_at = new Date().toISOString();
    userByProvider.updated_at = new Date().toISOString();
    return userByProvider;
  }

  if (userByEmail) {
    ensureSocialProvider(userByEmail, provider, profile.providerUserId);
    userByEmail.full_name = userByEmail.full_name || profile.name;
    userByEmail.username = userByEmail.username || profile.name;
    userByEmail.avatar = userByEmail.avatar || profile.picture;
    userByEmail.signup_method = userByEmail.signup_method || provider;
    userByEmail.last_login_at = new Date().toISOString();
    userByEmail.updated_at = new Date().toISOString();
    return userByEmail;
  }

  return createNewUserFromSocial(db, profile, provider);
};

app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password, phone } = req.body || {};

    const normalizedEmail = normalizeEmail(email || '');
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }

    const db = readDb();
    if (!Array.isArray(db.users)) db.users = [];

    const existingEmailUser = findUserByEmail(db.users, normalizedEmail);
    if (existingEmailUser) {
      return res.status(409).json({ success: false, message: 'Email đã tồn tại. Vui lòng đăng nhập.' });
    }

    if (phone) {
      const duplicatedPhone = db.users.find((user) => user.phone && String(user.phone) === String(phone));
      if (duplicatedPhone) {
        return res.status(409).json({ success: false, message: 'Số điện thoại đã được sử dụng' });
      }
    }

    const maxId = db.users.reduce((max, user) => Math.max(max, Number(user.id) || 0), 0);
    const now = new Date().toISOString();
    const newUser = {
      id: maxId + 1,
      username: username || normalizedEmail.split('@')[0],
      full_name: username || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: phone || '',
      avatar: null,
      role_id: 3,
      branch_id: null,
      lotte_points: 0,
      membership_level: 'Đồng',
      signup_method: 'email',
      social_providers: [],
      social_links: { facebook: null, google: null },
      status: 'ACTIVE',
      is_active: true,
      email_verified: false,
      password,
      password_hash: password,
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };

    db.users.push(newUser);
    writeDb(db);

    return res.status(201).json({
      success: true,
      token: createAuthToken(newUser),
      user: toPublicUser(newUser),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Đăng ký thất bại do lỗi hệ thống' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { emailOrPhone, password } = req.body || {};
    const identifier = String(emailOrPhone || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng nhập' });
    }

    const db = readDb();
    if (!Array.isArray(db.users)) db.users = [];

    const normalizedIdentifier = normalizeEmail(identifier);
    const user = db.users.find((candidate) => {
      const emailMatch = normalizeEmail(candidate.email || '') === normalizedIdentifier;
      const phoneMatch = String(candidate.phone || '').trim() === identifier;
      return emailMatch || phoneMatch;
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email/SĐT hoặc mật khẩu không chính xác' });
    }

    if (!user.is_active || user.status === 'INACTIVE' || user.status === 'LOCKED') {
      return res.status(403).json({ success: false, message: 'Tài khoản đang bị khóa' });
    }

    const hasPassword = Boolean(user.password_hash || user.password);
    if (!hasPassword) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này chưa có mật khẩu. Vui lòng đăng nhập bằng Google/Facebook.',
      });
    }

    if (password !== user.password_hash && password !== user.password) {
      return res.status(401).json({ success: false, message: 'Email/SĐT hoặc mật khẩu không chính xác' });
    }

    user.last_login_at = new Date().toISOString();
    user.updated_at = new Date().toISOString();
    writeDb(db);

    return res.json({ success: true, token: createAuthToken(user), user: toPublicUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Đăng nhập thất bại do lỗi hệ thống' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const userId = parseAuthToken(token);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const db = readDb();
    const user = (db.users || []).find((candidate) => Number(candidate.id) === Number(userId));
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, token, user: toPublicUser(user) });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body || {};

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ success: false, message: 'Thiếu credential từ Google' });
  }

  try {
    const profile = await verifyGoogleCredential(credential);
    const db = readDb();
    if (!Array.isArray(db.users)) db.users = [];

    const user = resolveSocialLogin(db, profile, 'google');
    writeDb(db);

    return res.json({
      success: true,
      token: createAuthToken(user),
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Đăng nhập Google thất bại do lỗi mạng/hệ thống' });
  }
});

app.post('/api/auth/facebook', async (req, res) => {
  const { accessToken } = req.body || {};

  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ success: false, message: 'Thiếu access token từ Facebook' });
  }

  try {
    const profile = await verifyFacebookAccessToken(accessToken);
    const db = readDb();
    if (!Array.isArray(db.users)) db.users = [];

    const user = resolveSocialLogin(db, profile, 'facebook');
    writeDb(db);

    return res.json({
      success: true,
      token: createAuthToken(user),
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Đăng nhập Facebook thất bại do lỗi mạng/hệ thống' });
  }
});

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  let userId;
  try {
    userId = parseAuthToken(token);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Invalid token payload' });
  }
  req.userId = userId;
  next();
};

app.put('/api/me', requireAuth, (req, res) => {
  try {
    const rawData = fs.readFileSync(dataFile, 'utf8');
    const db = JSON.parse(rawData);

    const userIndex = db.users.findIndex((u) => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { username, email, phone, avatar, first_name, last_name, full_name, dob, gender, address, bio, preferences } = req.body;

    const updatedUser = { ...db.users[userIndex] };
    if (username !== undefined) updatedUser.username = username;
    if (email !== undefined) updatedUser.email = email;
    if (phone !== undefined) updatedUser.phone = phone;
    if (avatar !== undefined) updatedUser.avatar = avatar;
    if (first_name !== undefined) updatedUser.first_name = first_name;
    if (last_name !== undefined) updatedUser.last_name = last_name;
    if (full_name !== undefined) updatedUser.full_name = full_name;
    if (dob !== undefined) updatedUser.dob = dob;
    if (gender !== undefined) updatedUser.gender = gender;
    if (address !== undefined) updatedUser.address = address;
    if (bio !== undefined) updatedUser.bio = bio;
    if (preferences !== undefined) updatedUser.preferences = preferences;

    db.users[userIndex] = updatedUser;

    fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating mockData.json:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  let ordersList = db.orders || [];
  const order = ordersList.find(o => String(o.id) === req.params.id && o.user_id === req.userId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

app.put('/api/orders/:id/cancel', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const orderIdx = (db.orders || []).findIndex(o => String(o.id) === req.params.id && o.user_id === req.userId);
  if (orderIdx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  
  const order = db.orders[orderIdx];
  const CANCELLABLE_STATUSES = ['PENDING', 'PROCESSING'];
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return res.status(409).json({ success: false, message: 'Không thể hủy đơn hàng ở trạng thái này' });
  }
  
  order.status = 'CANCELLED';
  if (order.payment && order.payment.status === 'PAID') {
    if (!db.payment_transactions) db.payment_transactions = [];
    const transactionId = "refund_" + Date.now();
    db.payment_transactions.push({
      id: transactionId,
      order_id: order.id,
      provider: order.payment.method,
      transaction_id: transactionId,
      amount: order.total_amount,
      status: "REFUND_PENDING",
      created_at: new Date().toISOString()
    });
    order.payment.status = 'REFUND_PENDING';
  }
  
  if (!order.tracking) order.tracking = { history: [] };
  if (!order.tracking.history) order.tracking.history = [];
  order.tracking.history.push({
    timestamp: new Date().toISOString(),
    status: 'CANCELLED',
    note: req.body.reason || 'Người dùng hủy đơn hàng',
    by: req.userId
  });
  
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
  res.json({ success: true, order });
});

app.post('/api/orders/:id/reorder', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const order = (db.orders || []).find(o => String(o.id) === req.params.id && o.user_id === req.userId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  if (!db.carts) db.carts = [];
  let cart = db.carts.find(c => c.user_id === req.userId);
  if (!cart) {
    cart = { id: `cart_${req.userId}`, user_id: req.userId, items: [], updated_at: new Date().toISOString() };
    db.carts.push(cart);
  }
  
  let totalAdded = 0;
  let outOfStockCount = 0;
  let clippedCount = 0;

  order.items.forEach(item => {
    // Find stock from branch_products
    const branchProduct = (db.branch_products || []).find(bp => bp.id === item.branch_product_id);
    if (!branchProduct) {
      outOfStockCount++;
      return;
    }

    let allowedQty = branchProduct.stock;
    if (branchProduct.max_purchase_limit) {
      allowedQty = Math.min(allowedQty, branchProduct.max_purchase_limit);
    }
    
    if (allowedQty <= 0) {
      outOfStockCount++;
      return;
    }

    let qtyToAdd = item.quantity;
    if (qtyToAdd > allowedQty) {
      qtyToAdd = allowedQty;
      clippedCount++;
    }

    const existing = cart.items.find(ci => ci.branch_product_id === item.branch_product_id);
    if (existing) {
      // Re-evaluate limits when combining with existing items in cart
      const newQty = existing.quantity + qtyToAdd;
      existing.quantity = Math.min(newQty, allowedQty);
    } else {
      cart.items.push({ 
        branch_product_id: item.branch_product_id, 
        quantity: qtyToAdd,
        price: item.price
      });
    }
    totalAdded++;
  });
  
  cart.updated_at = new Date().toISOString();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
  
  if (totalAdded === 0) {
    return res.status(400).json({ success: false, message: "Sản phẩm đã hết hàng" });
  }

  let message = `Đã thêm ${totalAdded} sản phẩm vào giỏ hàng`;
  if (clippedCount > 0) message += ` (một số sản phẩm đã điều chỉnh theo số lượng/lượng tồn tối đa)`;

  res.json({ success: true, message, updatedCart: cart });
});

app.get('/api/track/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const order = (db.orders || []).find(o => String(o.id) === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  res.json({ success: true, tracking: order.tracking || null, status: order.status });
});

app.get('/api/addresses', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const addresses = (db.user_addresses || []).filter(a => a.user_id === req.userId);
  res.json({ success: true, addresses });
});

app.post('/api/addresses', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  if (!db.user_addresses) db.user_addresses = [];
  
  const payload = req.body;
  // Validation
  if (!payload.name || !payload.name.trim()) return res.status(400).json({ success: false, message: 'Tên người nhận là bắt buộc' });
  if (!payload.street || !payload.street.trim()) return res.status(400).json({ success: false, message: 'Địa chỉ cụ thể là bắt buộc' });
  if (!payload.city || !payload.city.trim()) return res.status(400).json({ success: false, message: 'Tỉnh/TP là bắt buộc' });
  if (payload.phone && !/^(0|\+84)(\d{9,10})$/.test(payload.phone)) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
  }

  if (payload.is_default) {
    db.user_addresses.filter(a => a.user_id === req.userId).forEach(a => { a.is_default = false; });
  }
  
  const newAddr = {
    ...payload,
    id: `addr_${Date.now()}`,
    user_id: req.userId,
    created_at: new Date().toISOString()
  };
  
  db.user_addresses.push(newAddr);
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
  res.json({ success: true, address: newAddr });
});

app.put('/api/addresses/:id', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const addrIdx = (db.user_addresses || []).findIndex(a => String(a.id) === req.params.id && a.user_id === req.userId);
  if (addrIdx === -1) return res.status(404).json({ success: false, message: 'Address not found' });
  
  const payload = req.body;
  if (payload.is_default) {
    db.user_addresses.filter(a => a.user_id === req.userId).forEach(a => { a.is_default = false; });
  }
  
  db.user_addresses[addrIdx] = { ...db.user_addresses[addrIdx], ...payload, id: db.user_addresses[addrIdx].id };
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
  res.json({ success: true, address: db.user_addresses[addrIdx] });
});

app.delete('/api/addresses/:id', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const addrIdx = (db.user_addresses || []).findIndex(a => String(a.id) === req.params.id && a.user_id === req.userId);
  if (addrIdx === -1) return res.status(404).json({ success: false, message: 'Address not found' });
  
  const wasDefault = db.user_addresses[addrIdx].is_default;
  db.user_addresses.splice(addrIdx, 1);
  
  if (wasDefault) {
     const remaining = db.user_addresses.filter(a => a.user_id === req.userId);
     if (remaining.length > 0) {
       remaining[0].is_default = true;
     }
  }
  
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
  res.json({ success: true, message: 'Deleted', addresses: db.user_addresses.filter(a => a.user_id === req.userId) });
});

app.put('/api/addresses/:id/set-default', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const addr = (db.user_addresses || []).find(a => String(a.id) === req.params.id && a.user_id === req.userId);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
  
  db.user_addresses.filter(a => a.user_id === req.userId).forEach(a => { a.is_default = false; });
  addr.is_default = true;
  
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
  res.json({ success: true, address: addr });
});

app.get('/api/orders/:id/invoice', requireAuth, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const order = (db.orders || []).find(o => String(o.id) === req.params.id && o.user_id === req.userId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  // Build simple HTML invoice
  const user = (db.users || []).find(u => u.id === req.userId) || {};
  const addr = order.order_address || {};
  const itemsHtml = (order.items || []).map((item, i) =>
    `<tr><td style="border:1px solid #ddd;padding:8px">${i+1}</td><td style="border:1px solid #ddd;padding:8px">${item.product_name}</td><td style="border:1px solid #ddd;padding:8px;text-align:right">${item.quantity}</td><td style="border:1px solid #ddd;padding:8px;text-align:right">${(item.price||0).toLocaleString('vi-VN')} \u0111</td><td style="border:1px solid #ddd;padding:8px;text-align:right">${((item.price||0)*item.quantity).toLocaleString('vi-VN')} \u0111</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>H\u00f3a \u0111\u01a1n #${order.id}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px}
table{width:100%;border-collapse:collapse}th{background:#f5f5f5;border:1px solid #ddd;padding:8px;text-align:left}
.total{font-size:1.2em;font-weight:bold;text-align:right;margin-top:20px}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e74c3c;padding-bottom:10px;margin-bottom:20px}
</style></head><body>
<div class="header"><div><h1 style="margin:0;color:#e74c3c">LOTTE Mart</h1><p style="margin:4px 0 0">H\u00d3A \u0110\u01a0N B\u00c1N H\u00c0NG</p></div><div style="text-align:right"><p style="margin:0">M\u00e3 \u0111\u01a1n: <strong>#${order.id}</strong></p><p style="margin:4px 0 0">Ng\u00e0y: ${new Date(order.created_at).toLocaleDateString('vi-VN')}</p></div></div>
<div style="display:flex;justify-content:space-between;margin-bottom:20px"><div><h3>Kh\u00e1ch h\u00e0ng</h3><p>${addr.receiver_name || user.full_name || user.username || ''}</p><p>${addr.phone || user.phone || ''}</p><p>${addr.full_address || ''}</p></div><div style="text-align:right"><h3>Thanh to\u00e1n</h3><p>Ph\u01b0\u01a1ng th\u1ee9c: ${order.payment?.method || 'COD'}</p><p>Tr\u1ea1ng th\u00e1i: ${order.payment?.status || 'N/A'}</p></div></div>
<table><thead><tr><th>#</th><th>S\u1ea3n ph\u1ea9m</th><th style="text-align:right">SL</th><th style="text-align:right">\u0110\u01a1n gi\u00e1</th><th style="text-align:right">Th\u00e0nh ti\u1ec1n</th></tr></thead><tbody>${itemsHtml}</tbody></table>
<div style="margin-top:20px;border-top:1px solid #ddd;padding-top:10px"><div style="display:flex;justify-content:space-between"><span>Ph\u00ed v\u1eadn chuy\u1ec3n:</span><span>${(order.shipping_fee||0).toLocaleString('vi-VN')} \u0111</span></div><div style="display:flex;justify-content:space-between"><span>Gi\u1ea3m gi\u00e1:</span><span>-${(order.discount_amount||0).toLocaleString('vi-VN')} \u0111</span></div></div>
<div class="total">T\u1ed5ng c\u1ed9ng: ${(order.total_amount||0).toLocaleString('vi-VN')} \u0111</div>
<p style="text-align:center;margin-top:40px;color:#999;font-size:12px">C\u1ea3m \u01a1n qu\u00fd kh\u00e1ch \u0111\u00e3 mua h\u00e0ng t\u1ea1i LOTTE Mart</p>
</body></html>`;

  // Save as static file
  const invoicesDir = path.join(__dirname, 'public', 'invoices');
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
  const filename = `invoice_${order.id}.html`;
  fs.writeFileSync(path.join(invoicesDir, filename), html, 'utf8');
  
  // Save generated_invoice_url to order
  const orderIdx = db.orders.findIndex(o => String(o.id) === String(order.id));
  if (orderIdx !== -1) {
    db.orders[orderIdx].generated_invoice_url = `/invoices/${filename}`;
    fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
  }
  
  res.json({ success: true, url: `/invoices/${filename}` });
});

// Serve static invoices
app.use('/invoices', express.static(path.join(__dirname, 'public', 'invoices')));

app.listen(PORT, () => {
  console.log(`Express API running on http://localhost:${PORT}`);
});
