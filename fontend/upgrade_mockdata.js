// upgrade_mockdata.js — Upgrades mockData.json preserving all existing data
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'mockData.json');
const DEST = path.join(__dirname, 'mockData.json');
const d = JSON.parse(fs.readFileSync(SRC, 'utf-8'));

// ═══════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════
const iso = (daysAgo=0,h=10) => {
  const dt = new Date('2026-03-23T00:00:00Z');
  dt.setDate(dt.getDate()-daysAgo);
  dt.setHours(h);
  return dt.toISOString();
};
const futureIso = (daysAhead=7,h=23) => {
  const dt = new Date('2026-03-23T00:00:00Z');
  dt.setDate(dt.getDate()+daysAhead);
  dt.setHours(h);
  return dt.toISOString();
};

// ═══════════════════════════════════════════════
// P0: ROLES
// ═══════════════════════════════════════════════
if (!d.roles) {
  d.roles = [
    { id: 1, name: 'Super Admin', description: 'Toàn quyền hệ thống', permissions: ['*'], is_active: true, created_at: iso(90) },
    { id: 2, name: 'Manager', description: 'Quản lý chi nhánh', permissions: ['products.read','products.write','orders.read','orders.write','users.read','reviews.read','reviews.write','support.read','support.write','notifications.send','loyalty.adjust','reports.branch'], is_active: true, created_at: iso(90) },
    { id: 3, name: 'Customer', description: 'Khách hàng', permissions: ['self.read','self.write','orders.own','reviews.own','support.own'], is_active: true, created_at: iso(90) },
    { id: 4, name: 'Staff', description: 'Nhân viên xử lý', permissions: ['orders.read','orders.update_status','reviews.moderate','support.reply'], is_active: true, created_at: iso(60) },
    { id: 5, name: 'Marketing', description: 'Nhân viên marketing', permissions: ['promotions.read','promotions.write','events.read','events.write','banners.read','banners.write','notifications.send','coupons.read','coupons.write'], is_active: true, created_at: iso(60) }
  ];
}

// ═══════════════════════════════════════════════
// P0: BRANCHES
// ═══════════════════════════════════════════════
if (!d.branches) {
  d.branches = [
    { id: 1, code: 'HCM01', name: 'Lotte Mart Quận 7', address: '469 Nguyễn Hữu Thọ, Tân Hưng, Quận 7', city: 'Hồ Chí Minh', district: 'Quận 7', ward: 'Tân Hưng', phone: '028 5411 5555', operating_hours: '08:00-22:00', manager_user_id: 2, coordinates: { lat: 10.7326, lng: 106.7196 }, is_active: true, created_at: iso(365), updated_at: iso(1) },
    { id: 2, code: 'HCM02', name: 'Lotte Mart Gò Vấp', address: '242 Nguyễn Văn Lượng, Phường 17, Gò Vấp', city: 'Hồ Chí Minh', district: 'Gò Vấp', ward: 'Phường 17', phone: '028 5412 6666', operating_hours: '08:00-22:00', manager_user_id: 6, coordinates: { lat: 10.8326, lng: 106.6596 }, is_active: true, created_at: iso(300), updated_at: iso(1) },
    { id: 3, code: 'HN01', name: 'Lotte Mart Ba Đình', address: '54 Liễu Giai, Ba Đình, Hà Nội', city: 'Hà Nội', district: 'Ba Đình', ward: 'Ngọc Khánh', phone: '024 3333 7777', operating_hours: '08:00-22:00', manager_user_id: null, coordinates: { lat: 21.0316, lng: 105.8177 }, is_active: true, created_at: iso(200), updated_at: iso(5) },
    { id: 4, code: 'DN01', name: 'Lotte Mart Đà Nẵng', address: '6 Nại Nam, Hải Châu, Đà Nẵng', city: 'Đà Nẵng', district: 'Hải Châu', ward: 'Hải Châu 1', phone: '0236 3888 999', operating_hours: '08:30-21:30', manager_user_id: null, coordinates: { lat: 16.0544, lng: 108.2022 }, is_active: true, created_at: iso(150), updated_at: iso(10) }
  ];
}

// ═══════════════════════════════════════════════
// UPGRADE USERS — add missing fields
// ═══════════════════════════════════════════════
d.users.forEach(u => {
  if (u.is_active === undefined) u.is_active = true;
  if (!u.status) u.status = 'active';
  if (!u.created_at) u.created_at = iso(90);
  if (!u.updated_at) u.updated_at = iso(1);
  if (!u.last_login_at) u.last_login_at = iso(0, 8);
  if (!u.full_name && u.username) {
    const names = { superadmin: 'Nguyễn Văn Admin', manager_q7: 'Trần Minh Quản Lý', user_alice: 'Lê Thị Alice', user_bob: 'Phạm Bob', marketing_anna: 'Anna Nguyễn', manager_gv: 'Hoàng Gò Vấp' };
    u.full_name = names[u.username] || u.username;
  }
  if (!u.password && u.password_hash) u.password = u.password_hash;
});

// Add more users for better seed data
const existingUserIds = d.users.map(u => u.id);
const newUsers = [
  { id: 7, username: 'staff_hcm01', full_name: 'Nguyễn Văn Staff', email: 'staff1@lotte.com', password: 'Staff@123', password_hash: 'Staff@123', phone: '0909111222', avatar: 'https://i.pravatar.cc/150?img=10', role_id: 4, branch_id: 1, lotte_points: 200, membership_level: 'Bạc', is_active: true, status: 'active', created_at: iso(60), updated_at: iso(1), last_login_at: iso(0,9) },
  { id: 8, username: 'user_charlie', full_name: 'Charlie Trần', email: 'charlie@gmail.com', password: 'Charlie@123', password_hash: 'Charlie@123', phone: '0912345678', avatar: 'https://i.pravatar.cc/150?img=11', role_id: 3, branch_id: null, lotte_points: 3200, membership_level: 'Bạc', is_active: true, status: 'active', created_at: iso(45), updated_at: iso(2), last_login_at: iso(1,14) },
  { id: 9, username: 'user_diana', full_name: 'Diana Lê', email: 'diana@gmail.com', password: 'Diana@123', password_hash: 'Diana@123', phone: '0987654321', avatar: 'https://i.pravatar.cc/150?img=5', role_id: 3, branch_id: null, lotte_points: 8500, membership_level: 'Vàng', is_active: true, status: 'active', created_at: iso(120), updated_at: iso(3), last_login_at: iso(0,11) },
  { id: 10, username: 'user_eric', full_name: 'Eric Võ', email: 'eric@gmail.com', password: 'Eric@1234', password_hash: 'Eric@1234', phone: '0901234567', avatar: 'https://i.pravatar.cc/150?img=12', role_id: 3, branch_id: null, lotte_points: 500, membership_level: 'Đồng', is_active: false, status: 'locked', created_at: iso(30), updated_at: iso(5), last_login_at: iso(10,8) }
];
newUsers.forEach(u => { if (!existingUserIds.includes(u.id)) d.users.push(u); });

// ═══════════════════════════════════════════════
// P0: MEMBERSHIP_TIERS
// ═══════════════════════════════════════════════
if (!d.membership_tiers) {
  d.membership_tiers = [
    { id: 1, name: 'Đồng', slug: 'bronze', min_points: 0, max_points: 999, color: '#CD7F32', discount_percent: 0, benefits: ['Tích điểm 1% trên mỗi đơn hàng'], badge_icon: 'workspace_premium', is_active: true },
    { id: 2, name: 'Bạc', slug: 'silver', min_points: 1000, max_points: 4999, color: '#C0C0C0', discount_percent: 2, benefits: ['Tích điểm 2%', 'Freeship đơn từ 300k', 'Ưu tiên hỗ trợ'], badge_icon: 'workspace_premium', is_active: true },
    { id: 3, name: 'Vàng', slug: 'gold', min_points: 5000, max_points: 9999, color: '#FFD700', discount_percent: 5, benefits: ['Tích điểm 3%', 'Freeship mọi đơn', 'Quà sinh nhật', 'Deal độc quyền'], badge_icon: 'diamond', is_active: true },
    { id: 4, name: 'Kim Cương', slug: 'diamond', min_points: 10000, max_points: null, color: '#B9F2FF', discount_percent: 10, benefits: ['Tích điểm 5%', 'Freeship + giao nhanh 1h', 'Quà sinh nhật Premium', 'Hotline VIP 24/7', 'Early access Flash Sale'], badge_icon: 'diamond', is_active: true }
  ];
}

// ═══════════════════════════════════════════════
// P0: LOYALTY_RULES
// ═══════════════════════════════════════════════
if (!d.loyalty_rules) {
  d.loyalty_rules = [
    { id: 1, action_type: 'ORDER_COMPLETE', points_per_unit: 1, unit: 'per_10000_vnd', description: '1 điểm cho mỗi 10.000đ', min_order: 50000, is_active: true, created_at: iso(90) },
    { id: 2, action_type: 'REVIEW_POST', points_per_unit: 10, unit: 'per_review', description: '10 điểm khi viết đánh giá', min_order: 0, is_active: true, created_at: iso(90) },
    { id: 3, action_type: 'FIRST_ORDER', points_per_unit: 50, unit: 'one_time', description: '50 điểm cho đơn hàng đầu tiên', min_order: 0, is_active: true, created_at: iso(90) },
    { id: 4, action_type: 'BIRTHDAY', points_per_unit: 100, unit: 'yearly', description: '100 điểm vào ngày sinh nhật', min_order: 0, is_active: true, created_at: iso(90) },
    { id: 5, action_type: 'REFERRAL', points_per_unit: 200, unit: 'per_referral', description: '200 điểm khi giới thiệu bạn bè', min_order: 0, is_active: true, created_at: iso(60) }
  ];
}

// ═══════════════════════════════════════════════
// P0: NOTIFICATION_TEMPLATES
// ═══════════════════════════════════════════════
if (!d.notification_templates) {
  d.notification_templates = [
    { id: 1, name: 'order_confirmed', title_template: 'Đơn hàng #{order_id} đã xác nhận', body_template: 'Đơn hàng của bạn đã được xác nhận và đang chuẩn bị.', type: 'order', is_active: true },
    { id: 2, name: 'order_shipping', title_template: 'Đơn hàng #{order_id} đang giao', body_template: 'Đơn hàng đang trên đường đến bạn. Mã vận đơn: {tracking_number}', type: 'order', is_active: true },
    { id: 3, name: 'order_delivered', title_template: 'Đơn hàng #{order_id} đã giao', body_template: 'Đơn hàng đã được giao thành công. Hãy đánh giá sản phẩm nhé!', type: 'order', is_active: true },
    { id: 4, name: 'promotion_new', title_template: '{promo_title}', body_template: 'Ưu đãi mới dành cho bạn! Giảm đến {discount}%. Nhanh tay!', type: 'promotion', is_active: true },
    { id: 5, name: 'coupon_received', title_template: 'Bạn nhận được mã giảm giá!', body_template: 'Mã {coupon_code} giảm {discount_value}. Áp dụng ngay!', type: 'promotion', is_active: true },
    { id: 6, name: 'points_earned', title_template: 'Bạn vừa nhận {points} điểm!', body_template: 'Tích lũy điểm từ {source}. Tổng điểm hiện tại: {total_points}', type: 'loyalty', is_active: true },
    { id: 7, name: 'support_reply', title_template: 'Phản hồi yêu cầu hỗ trợ #{ticket_id}', body_template: 'Đội ngũ hỗ trợ đã phản hồi yêu cầu của bạn. Xem ngay!', type: 'support', is_active: true },
    { id: 8, name: 'review_reply', title_template: 'Phản hồi đánh giá của bạn', body_template: 'Lotte Mart đã phản hồi đánh giá của bạn về {product_name}', type: 'system', is_active: true }
  ];
}

// ═══════════════════════════════════════════════
// P0: AUDIT_LOGS
// ═══════════════════════════════════════════════
if (!d.audit_logs) {
  d.audit_logs = [
    { id: 1, user_id: 1, action: 'CREATE', entity_type: 'product', entity_id: 12, description: 'Tạo sản phẩm mới', old_data: null, new_data: '{"name":"Bộ chăm sóc da Innisfree"}', ip: '192.168.1.100', device: 'Chrome/Windows', branch_id: null, created_at: iso(5) },
    { id: 2, user_id: 2, action: 'UPDATE', entity_type: 'order', entity_id: 1001, description: 'Cập nhật trạng thái đơn hàng', old_data: '{"status":"PENDING"}', new_data: '{"status":"CONFIRMED"}', ip: '192.168.1.101', device: 'Chrome/Mac', branch_id: 1, created_at: iso(4) },
    { id: 3, user_id: 1, action: 'UPDATE', entity_type: 'coupon', entity_id: 1, description: 'Cập nhật mã giảm giá WELCOME20', old_data: '{"usage_limit":100}', new_data: '{"usage_limit":200}', ip: '192.168.1.100', device: 'Chrome/Windows', branch_id: null, created_at: iso(3) },
    { id: 4, user_id: 5, action: 'CREATE', entity_type: 'promotion', entity_id: 'promo_5', description: 'Tạo khuyến mãi mới', old_data: null, new_data: '{"title":"Sale Cuối Tháng 3"}', ip: '192.168.1.105', device: 'Firefox/Windows', branch_id: null, created_at: iso(2) },
    { id: 5, user_id: 7, action: 'UPDATE', entity_type: 'order', entity_id: 1005, description: 'Xác nhận giao hàng đơn #1005', old_data: '{"status":"SHIPPING"}', new_data: '{"status":"DELIVERED"}', ip: '10.0.0.50', device: 'Chrome/Windows', branch_id: 1, created_at: iso(1) }
  ];
}

// ═══════════════════════════════════════════════
// P1: EVENT_POST_DETAILS
// ═══════════════════════════════════════════════
if (!d.event_post_details) {
  d.event_post_details = [];
  (d.event_posts || []).slice(0, 6).forEach(post => {
    d.event_post_details.push({
      post_id: post.id,
      content_blocks: [
        { type: 'paragraph', content: post.excerpt || 'Nội dung chi tiết sự kiện.' },
        { type: 'heading', content: 'Thông tin chi tiết', level: 2 },
        { type: 'paragraph', content: 'Lotte Mart tổ chức chương trình với nhiều ưu đãi hấp dẫn dành cho khách hàng thân thiết.' },
        { type: 'image', url: post.thumbnail || 'https://via.placeholder.com/800x400', caption: post.title },
        { type: 'heading', content: 'Điều kiện tham gia', level: 3 },
        { type: 'list', items: ['Khách hàng có thẻ thành viên Lotte Mart', 'Đơn hàng từ 500.000đ trở lên', 'Áp dụng tại các chi nhánh tham gia'] },
        { type: 'quote', content: 'Mua sắm thông minh - Sống chất lượng cùng Lotte Mart!', author: 'Lotte Mart Vietnam' },
        { type: 'paragraph', content: 'Liên hệ hotline 1900 6099 để biết thêm chi tiết.' }
      ],
      read_time: Math.floor(Math.random() * 5) + 3,
      updated_at: iso(Math.floor(Math.random() * 10))
    });
  });
}

// Upgrade event_posts with missing fields
(d.event_posts || []).forEach(p => {
  if (!p.author_avatar) p.author_avatar = 'https://i.pravatar.cc/50?img=' + (p.id % 10);
  if (!p.read_time) p.read_time = Math.floor(Math.random() * 5) + 3;
  if (!p.likes) p.likes = Math.floor(Math.random() * 50);
  if (!p.status) p.status = 'published';
  if (!p.created_at) p.created_at = p.published_at || iso(Math.floor(Math.random() * 30));
  if (!p.updated_at) p.updated_at = p.created_at;
  if (!p.created_by) p.created_by = 5;
  if (!p.tags) p.tags = [];
  if (!p.related_post_ids) p.related_post_ids = [];
});

// Upgrade event_comments
(d.event_comments || []).forEach(c => {
  if (!c.status) c.status = 'approved';
  if (!c.user_name) {
    const user = d.users.find(u => u.id === c.user_id);
    c.user_name = user ? (user.full_name || user.username) : 'Người dùng';
  }
  if (!c.user_avatar) c.user_avatar = 'https://i.pravatar.cc/40?img=' + (c.user_id || 1);
});

// ═══════════════════════════════════════════════
// UPGRADE CATEGORIES
// ═══════════════════════════════════════════════
d.categories.forEach(c => {
  if (!c.created_at) c.created_at = iso(180);
  if (!c.updated_at) c.updated_at = iso(5);
  if (!c.created_by) c.created_by = 1;
});
const catNames = [
  { id: 5, name: 'Đồ uống', slug: 'do-uong', parent_id: null, icon: 'local_cafe', description: 'Nước giải khát, trà, cà phê', display_order: 5, is_active: true, product_count: 8 },
  { id: 6, name: 'Chăm sóc cá nhân', slug: 'cham-soc-ca-nhan', parent_id: null, icon: 'face_5', description: 'Mỹ phẩm, chăm sóc da, tóc', display_order: 6, is_active: true, product_count: 5 },
  { id: 7, name: 'Đồ gia dụng', slug: 'do-gia-dung', parent_id: null, icon: 'home', description: 'Đồ dùng nhà bếp, phòng tắm', display_order: 7, is_active: true, product_count: 4 },
  { id: 8, name: 'Thời trang', slug: 'thoi-trang', parent_id: null, icon: 'apparel', description: 'Quần áo, phụ kiện', display_order: 8, is_active: true, product_count: 3 }
];
catNames.forEach(c => {
  c.image = null; c.banner = null; c.created_at = iso(90); c.updated_at = iso(5); c.created_by = 1;
  if (!d.categories.find(x => x.id === c.id)) d.categories.push(c);
});

// ═══════════════════════════════════════════════
// UPGRADE PRODUCTS
// ═══════════════════════════════════════════════
d.products.forEach(p => {
  if (p.is_active === undefined) p.is_active = true;
  if (!p.created_at) p.created_at = iso(60);
  if (!p.updated_at) p.updated_at = iso(2);
  if (!p.origin_country) p.origin_country = 'Việt Nam';
  if (p.average_rating === undefined) p.average_rating = 4.0;
  if (p.total_reviews === undefined) p.total_reviews = 0;
});

// ═══════════════════════════════════════════════
// UPGRADE BRANCH_PRODUCTS
// ═══════════════════════════════════════════════
d.branch_products.forEach(bp => {
  if (!bp.created_at) bp.created_at = iso(60);
  if (!bp.updated_at) bp.updated_at = bp.last_updated || iso(2);
  if (!bp.last_updated) bp.last_updated = bp.updated_at;
  if (bp.sold_count === undefined) bp.sold_count = Math.floor(Math.random() * 200);
  if (bp.is_active === undefined) bp.is_active = true;
  if (!bp.status) bp.status = 'in_stock';
});

// ═══════════════════════════════════════════════
// UPGRADE ORDERS + add seed data
// ═══════════════════════════════════════════════
(d.orders || []).forEach(o => {
  if (!o.created_at) o.created_at = iso(10);
  if (!o.updated_at) o.updated_at = o.created_at;
  if (o.updated_by === undefined) o.updated_by = null;
  if (!o.staff_note) o.staff_note = '';
  if (!o.cancel_reason) o.cancel_reason = '';
  if (!o.shipping_provider) o.shipping_provider = '';
  if (!o.subtotal) o.subtotal = o.total_amount || 0;
  if (!o.shipping_fee) o.shipping_fee = 0;
  if (!o.discount_amount) o.discount_amount = 0;
  if (!o.payment_method) o.payment_method = 'COD';
  if (!o.payment_status) o.payment_status = o.status === 'DELIVERED' ? 'PAID' : 'PENDING';
  if (!o.shipping_method) o.shipping_method = 'standard';
  if (!o.note) o.note = '';
  if (!o.vat_percent) o.vat_percent = 10;
});

const newOrders = [
  { id: 1002, user_id: 3, branch_id: 1, items: [{ branch_product_id: '102', quantity: 1, price: 55000, product_name: 'Mì Hảo Hảo Tôm Chua Cay (Thùng 30)', product_image: 'https://via.placeholder.com/100' }], subtotal: 55000, shipping_fee: 0, discount_amount: 0, total_amount: 55000, status: 'CONFIRMED', payment_method: 'MOMO', payment_status: 'PAID', shipping_method: 'standard', shipping_provider: 'GHTK', tracking_number: 'LM1002001', note: '', staff_note: 'Đã xác nhận', cancel_reason: '', updated_by: 7, vat_percent: 10, created_at: iso(8), updated_at: iso(7) },
  { id: 1003, user_id: 4, branch_id: 1, items: [{ branch_product_id: '103', quantity: 2, price: 89000, product_name: 'Dầu ăn Simply 2L', product_image: 'https://via.placeholder.com/100' }], subtotal: 178000, shipping_fee: 25000, discount_amount: 10000, total_amount: 193000, status: 'DELIVERED', payment_method: 'CARD', payment_status: 'PAID', shipping_method: 'fast', shipping_provider: 'GHN', tracking_number: 'LM1003002', note: '', staff_note: '', cancel_reason: '', updated_by: 7, vat_percent: 10, delivered_at: iso(3), created_at: iso(15), updated_at: iso(3) },
  { id: 1004, user_id: 8, branch_id: 2, items: [{ branch_product_id: '201', quantity: 3, price: 32500, product_name: 'Sữa tươi Vinamilk 1L', product_image: 'https://via.placeholder.com/100' }, { branch_product_id: '204', quantity: 1, price: 120000, product_name: 'Thịt heo ba rọi', product_image: 'https://via.placeholder.com/100' }], subtotal: 217500, shipping_fee: 0, discount_amount: 20000, total_amount: 197500, status: 'PROCESSING', payment_method: 'COD', payment_status: 'PENDING', shipping_method: 'standard', shipping_provider: '', tracking_number: '', note: '', staff_note: 'Đang đóng gói', cancel_reason: '', updated_by: null, vat_percent: 10, created_at: iso(2), updated_at: iso(1) },
  { id: 1005, user_id: 9, branch_id: 1, items: [{ branch_product_id: '105', quantity: 1, price: 250000, product_name: 'Bộ chăm sóc da', product_image: 'https://via.placeholder.com/100' }], subtotal: 250000, shipping_fee: 0, discount_amount: 25000, total_amount: 225000, status: 'DELIVERED', payment_method: 'VNPAY', payment_status: 'PAID', shipping_method: 'fast', shipping_provider: 'GHTK', tracking_number: 'LM1005003', note: '', staff_note: '', cancel_reason: '', updated_by: 7, vat_percent: 10, delivered_at: iso(1), created_at: iso(7), updated_at: iso(1) },
  { id: 1006, user_id: 3, branch_id: 1, items: [{ branch_product_id: '101', quantity: 5, price: 29000, product_name: 'Sữa tươi Vinamilk 1L', product_image: 'https://via.placeholder.com/100' }], subtotal: 145000, shipping_fee: 25000, discount_amount: 0, total_amount: 170000, status: 'CANCELLED', payment_method: 'COD', payment_status: 'CANCELLED', shipping_method: 'fast', shipping_provider: '', tracking_number: '', note: '', staff_note: '', cancel_reason: 'Khách hàng đổi ý', cancelled_at: iso(4), updated_by: null, vat_percent: 10, created_at: iso(5), updated_at: iso(4) },
  { id: 1007, user_id: 9, branch_id: 2, items: [{ branch_product_id: '202', quantity: 2, price: 58000, product_name: 'Mì Hảo Hảo', product_image: 'https://via.placeholder.com/100' }], subtotal: 116000, shipping_fee: 0, discount_amount: 0, total_amount: 116000, status: 'SHIPPING', payment_method: 'MOMO', payment_status: 'PAID', shipping_method: 'standard', shipping_provider: 'GHN', tracking_number: 'LM1007004', note: '', staff_note: 'Đã giao cho shipper', cancel_reason: '', updated_by: 7, vat_percent: 10, created_at: iso(3), updated_at: iso(1) },
  { id: 1008, user_id: 8, branch_id: 1, items: [{ branch_product_id: '106', quantity: 1, price: 450000, product_name: 'Nồi cơm điện', product_image: 'https://via.placeholder.com/100' }], subtotal: 450000, shipping_fee: 0, discount_amount: 45000, total_amount: 405000, status: 'PENDING', payment_method: 'CARD', payment_status: 'PENDING', shipping_method: 'standard', shipping_provider: '', tracking_number: '', note: 'Giao cuối tuần', staff_note: '', cancel_reason: '', updated_by: null, vat_percent: 10, created_at: iso(0, 9), updated_at: iso(0, 9) }
];
newOrders.forEach(o => { if (!d.orders.find(x => x.id === o.id)) d.orders.push(o); });

// ═══════════════════════════════════════════════
// UPGRADE REVIEWS
// ═══════════════════════════════════════════════
(d.reviews || []).forEach(r => {
  if (!r.status) r.status = 'approved';
  if (r.moderated_by === undefined) r.moderated_by = null;
  if (r.moderated_at === undefined) r.moderated_at = null;
  if (r.likes === undefined) r.likes = 0;
  if (!r.user_name) {
    const user = d.users.find(u => u.id === r.user_id);
    r.user_name = user ? (user.full_name || user.username) : 'Người dùng';
  }
});
const newReviews = [
  { id: 10, user_id: 8, product_id: 1, branch_product_id: 101, rating: 5, comment: 'Sữa rất tươi và ngon, con mình rất thích!', user_name: 'Charlie Trần', avatar: 'https://i.pravatar.cc/100?img=11', images: [], replies: [], likes: 3, status: 'approved', moderated_by: 7, moderated_at: iso(5), created_at: iso(6) },
  { id: 11, user_id: 9, product_id: 3, branch_product_id: 103, rating: 4, comment: 'Dầu ăn chất lượng tốt.', user_name: 'Diana Lê', avatar: 'https://i.pravatar.cc/100?img=5', images: [], replies: [{ id: 'rep_admin_1', user_id: 7, text: 'Cảm ơn bạn đã đánh giá!', created_at: iso(4) }], likes: 1, status: 'approved', moderated_by: null, moderated_at: null, created_at: iso(7) },
  { id: 12, user_id: 4, product_id: 2, branch_product_id: 102, rating: 2, comment: 'Mì hơi mặn so với trước.', user_name: 'Phạm Bob', avatar: 'https://i.pravatar.cc/100?img=4', images: [], replies: [], likes: 0, status: 'pending', moderated_by: null, moderated_at: null, created_at: iso(2) },
  { id: 13, user_id: 9, product_id: 1, branch_product_id: 101, rating: 5, comment: 'Mua đi mua lại nhiều lần, luôn hài lòng!', user_name: 'Diana Lê', avatar: 'https://i.pravatar.cc/100?img=5', images: [], replies: [], likes: 5, status: 'approved', moderated_by: null, moderated_at: null, created_at: iso(12) }
];
newReviews.forEach(r => { if (!d.reviews.find(x => x.id === r.id)) d.reviews.push(r); });

// ═══════════════════════════════════════════════
// UPGRADE SUPPORT
// ═══════════════════════════════════════════════
(d.support_tickets || []).forEach(t => {
  if (!t.priority) t.priority = 'medium';
  if (!t.category) t.category = 'general';
  if (t.assigned_to === undefined) t.assigned_to = null;
  if (t.closed_at === undefined) t.closed_at = null;
  if (t.internal_note === undefined) t.internal_note = '';
});
const newTickets = [
  { id: 't_5', user_id: 8, subject: 'Sản phẩm nhận được bị hư hỏng', status: 'OPEN', priority: 'high', category: 'product_quality', assigned_to: 7, closed_at: null, internal_note: 'Cần kiểm tra lô hàng', created_at: iso(1), updated_at: iso(1) },
  { id: 't_6', user_id: 9, subject: 'Muốn đổi phương thức thanh toán', status: 'RESOLVED', priority: 'low', category: 'payment', assigned_to: 7, closed_at: iso(2), internal_note: '', created_at: iso(5), updated_at: iso(2) }
];
newTickets.forEach(t => { if (!d.support_tickets.find(x => x.id === t.id)) d.support_tickets.push(t); });

const newMessages = [
  { id: 9, ticket_id: 't_5', sender_type: 'user', sender_id: 8, content: 'Tôi nhận được hộp sữa bị móp, bị rò rỉ.', created_at: iso(1, 10) },
  { id: 10, ticket_id: 't_5', sender_type: 'admin', sender_id: 7, content: 'Xin lỗi bạn. Vui lòng gửi hình ảnh để xử lý.', created_at: iso(1, 11) },
  { id: 11, ticket_id: 't_6', sender_type: 'user', sender_id: 9, content: 'Tôi muốn đổi từ COD sang chuyển khoản cho đơn #1005', created_at: iso(5, 9) },
  { id: 12, ticket_id: 't_6', sender_type: 'admin', sender_id: 7, content: 'Đã cập nhật cho đơn hàng. Cảm ơn bạn!', created_at: iso(4, 10) }
];
newMessages.forEach(m => { if (!d.messages.find(x => x.id === m.id)) d.messages.push(m); });

// ═══════════════════════════════════════════════
// UPGRADE NOTIFICATIONS
// ═══════════════════════════════════════════════
(d.notifications || []).forEach(n => {
  if (!n.type) n.type = 'system';
  if (n.is_read === undefined) n.is_read = false;
  if (!n.action_url) n.action_url = '';
  if (n.sent_by === undefined) n.sent_by = null;
  if (n.read_at === undefined) n.read_at = null;
});
const newNotifs = [
  { id: 'n6', user_id: 8, title: 'Chào mừng bạn!', message: 'Tạo tài khoản thành công. Nhận 50 điểm!', type: 'system', is_read: true, action_url: '/account/loyalty', sent_by: null, read_at: iso(44), created_at: iso(45) },
  { id: 'n7', user_id: 9, title: 'Đơn hàng #1005 đã giao', message: 'Đã giao thành công. Hãy đánh giá nhé!', type: 'order', is_read: false, action_url: '/account/orders/1005', sent_by: null, read_at: null, created_at: iso(1) },
  { id: 'n8', user_id: 3, title: 'Flash Sale Cuối Tuần!', message: 'Giảm đến 50%!', type: 'promotion', is_read: false, action_url: '/promotions', sent_by: 5, read_at: null, created_at: iso(0, 8) },
  { id: 'n9', user_id: 9, title: 'Bạn nhận 25 điểm!', message: 'Từ đơn hàng #1005.', type: 'loyalty', is_read: true, action_url: '/account/loyalty', sent_by: null, read_at: iso(0, 12), created_at: iso(1, 10) },
  { id: 'n10', user_id: 8, title: 'Phản hồi hỗ trợ', message: 'Đội ngũ đã phản hồi yêu cầu của bạn.', type: 'support', is_read: false, action_url: '/account/support', sent_by: 7, read_at: null, created_at: iso(1, 11) }
];
newNotifs.forEach(n => { if (!d.notifications.find(x => String(x.id) === String(n.id))) d.notifications.push(n); });

// ═══════════════════════════════════════════════
// UPGRADE COUPONS, PROMOTIONS, HOT_DEALS, BANNERS
// ═══════════════════════════════════════════════
(d.coupons || []).forEach(c => { if (c.is_active === undefined) c.is_active = true; if (!c.created_by) c.created_by = 1; if (!c.created_at) c.created_at = iso(30); });
(d.promotions || []).forEach(p => { if (p.is_active === undefined) p.is_active = true; if (!p.created_by) p.created_by = 5; if (!p.created_at) p.created_at = iso(15); if (!p.updated_at) p.updated_at = iso(2); if (!p.start_date) p.start_date = iso(15); });
(d.hot_deals || []).forEach(hd => { if (hd.is_active === undefined) hd.is_active = true; if (!hd.created_by) hd.created_by = 5; if (!hd.created_at) hd.created_at = iso(5); });
(d.home_banners || []).forEach((b, i) => { if (b.is_active === undefined) b.is_active = true; if (b.sort_order === undefined) b.sort_order = i + 1; if (!b.created_by) b.created_by = 5; });
(d.promo_banners || []).forEach(pb => { if (pb.is_active === undefined) pb.is_active = true; if (!pb.created_by) pb.created_by = 5; });
(d.featured_collections || []).forEach(fc => { if (fc.is_active === undefined) fc.is_active = true; });

// ═══════════════════════════════════════════════
// UPGRADE LOYALTY + more seed
// ═══════════════════════════════════════════════
(d.loyalty_transactions || []).forEach(t => { if (t.created_by === undefined) t.created_by = null; if (!t.description) t.description = ''; });
const newLoyalty = [
  { id: 'lp8', user_id: 8, points: 50, type: 'EARN', source: 'FIRST_ORDER', reference_id: '', description: 'Điểm thưởng đơn đầu tiên', created_by: null, created_at: iso(44) },
  { id: 'lp9', user_id: 9, points: 25, type: 'EARN', source: 'ORDER_1005', reference_id: 'ord_1005', description: 'Tích điểm đơn hàng #1005', created_by: null, created_at: iso(1) },
  { id: 'lp10', user_id: 3, points: -100, type: 'REDEEM', source: 'COUPON_EXCHANGE', reference_id: '', description: 'Đổi điểm lấy mã giảm giá', created_by: null, created_at: iso(10) },
  { id: 'lp11', user_id: 9, points: 100, type: 'EARN', source: 'BIRTHDAY', reference_id: '', description: 'Điểm sinh nhật', created_by: null, created_at: iso(30) },
  { id: 'lp12', user_id: 8, points: 20, type: 'EARN', source: 'ORDER_1004', reference_id: 'ord_1004', description: 'Tích điểm đơn hàng #1004', created_by: null, created_at: iso(2) }
];
newLoyalty.forEach(l => { if (!d.loyalty_transactions.find(x => x.id === l.id)) d.loyalty_transactions.push(l); });

// ═══════════════════════════════════════════════
// UPGRADE COUPON_USAGE
// ═══════════════════════════════════════════════
(d.coupon_usage || []).forEach(cu => { if (!cu.order_id) cu.order_id = null; if (!cu.discount_applied) cu.discount_applied = 0; });
const newUsage = [
  { id: 'cu_3', user_id: 9, coupon_id: 1, order_id: 1005, discount_applied: 25000, used_at: iso(7) },
  { id: 'cu_4', user_id: 8, coupon_id: 3, order_id: 1004, discount_applied: 20000, used_at: iso(2) }
];
newUsage.forEach(cu => { if (!d.coupon_usage.find(x => x.id === cu.id)) d.coupon_usage.push(cu); });

// ═══════════════════════════════════════════════
// MORE ADDRESSES, PAYMENT METHODS, TRANSACTIONS, DELIVERY SLOTS
// ═══════════════════════════════════════════════
[{ id: 3, user_id: 8, name: 'Charlie Trần', phone: '0912345678', city: 'Hồ Chí Minh', district: 'Quận 1', ward: 'Bến Nghé', street: '100 Lê Lợi', is_default: true },
 { id: 4, user_id: 9, name: 'Diana Lê', phone: '0987654321', city: 'Hồ Chí Minh', district: 'Quận 7', ward: 'Tân Phong', street: '50 Nguyễn Hữu Thọ', is_default: true },
 { id: 5, user_id: 9, name: 'Diana Lê (Cty)', phone: '0987654321', city: 'Hồ Chí Minh', district: 'Quận 3', ward: 'Phường 6', street: '200 Võ Văn Tần', is_default: false }
].forEach(a => { if (!d.user_addresses.find(x => x.id === a.id)) d.user_addresses.push(a); });

[{ id: 'pm_5', user_id: 8, type: 'card', last4: '4321', brand: 'Mastercard', expiry: '12/28', holder_name: 'CHARLIE TRAN', is_default: true },
 { id: 'pm_6', user_id: 9, type: 'ewallet', last4: '9999', brand: 'MoMo', expiry: null, holder_name: 'Diana Lê', is_default: true }
].forEach(pm => { if (!d.payment_methods.find(x => x.id === pm.id)) d.payment_methods.push(pm); });

[{ id: 'pt_2', order_id: 1003, provider: 'VNPay', amount: 193000, status: 'COMPLETED', created_at: iso(15), completed_at: iso(15, 11) },
 { id: 'pt_3', order_id: 1005, provider: 'VNPay', amount: 225000, status: 'COMPLETED', created_at: iso(7), completed_at: iso(7, 10) },
 { id: 'pt_4', order_id: 1007, provider: 'MoMo', amount: 116000, status: 'COMPLETED', created_at: iso(3), completed_at: iso(3, 9) }
].forEach(pt => { if (!d.payment_transactions.find(x => x.id === pt.id)) d.payment_transactions.push(pt); });

[{ id: 3, branch_id: 'HCM01', date: '2026-03-24', time_start: '08:00', time_end: '10:00', capacity: 20, booked: 5, is_available: true },
 { id: 4, branch_id: 'HCM01', date: '2026-03-24', time_start: '10:00', time_end: '12:00', capacity: 20, booked: 12, is_available: true },
 { id: 5, branch_id: 'HCM01', date: '2026-03-24', time_start: '14:00', time_end: '16:00', capacity: 20, booked: 20, is_available: false },
 { id: 6, branch_id: 'HCM02', date: '2026-03-24', time_start: '08:00', time_end: '10:00', capacity: 15, booked: 3, is_available: true },
 { id: 7, branch_id: 'HCM02', date: '2026-03-24', time_start: '14:00', time_end: '16:00', capacity: 15, booked: 8, is_available: true }
].forEach(s => { if (!d.delivery_slots.find(x => x.id === s.id)) d.delivery_slots.push(s); });

// ═══════════════════════════════════════════════
// NEW: PRODUCT_QUESTIONS, PURCHASE_HISTORY, SEARCH_HISTORY, ADMIN_SETTINGS
// ═══════════════════════════════════════════════
if (!d.product_questions) {
  d.product_questions = [
    { id: 1, product_id: 1, user_id: 4, question: 'Sữa này có phải sữa tươi 100% không?', answer: 'Vâng, đây là sữa tươi tiệt trùng 100% từ Vinamilk.', status: 'answered', answered_by: 7, created_at: iso(20), answered_at: iso(19) },
    { id: 2, product_id: 3, user_id: 8, question: 'Dầu ăn này có phù hợp cho chiên ngập dầu không?', answer: 'Có, dầu Simply phù hợp mọi phương pháp nấu ăn.', status: 'answered', answered_by: 7, created_at: iso(10), answered_at: iso(9) },
    { id: 3, product_id: 2, user_id: 9, question: 'Thùng mì này có bao nhiêu gói?', answer: '', status: 'pending', answered_by: null, created_at: iso(1), answered_at: null }
  ];
}

if (!d.purchase_history) {
  d.purchase_history = [];
  d.orders.filter(o => o.status === 'DELIVERED').forEach(o => {
    (o.items || []).forEach(item => {
      d.purchase_history.push({ id: 'ph_' + o.id + '_' + item.branch_product_id, user_id: o.user_id, order_id: String(o.id), branch_product_id: item.branch_product_id, price: item.price, quantity: item.quantity, total_amount: item.price * item.quantity, created_at: o.delivered_at || o.created_at });
    });
  });
}

if (!d.search_history) {
  d.search_history = [
    { id: 1, user_id: 3, keyword: 'sữa tươi', search_count: 12, last_searched: iso(0, 8) },
    { id: 2, user_id: 3, keyword: 'mì hảo hảo', search_count: 5, last_searched: iso(2) },
    { id: 3, user_id: 9, keyword: 'dầu ăn', search_count: 3, last_searched: iso(5) },
    { id: 4, user_id: 8, keyword: 'innisfree', search_count: 2, last_searched: iso(10) },
    { id: 5, user_id: 4, keyword: 'thịt heo', search_count: 8, last_searched: iso(1) }
  ];
}

if (!d.admin_settings) {
  d.admin_settings = [
    { key: 'default_shipping_fee', value: '25000', description: 'Phí ship mặc định (VND)', updated_by: 1, updated_at: iso(30) },
    { key: 'free_shipping_threshold', value: '300000', description: 'Ngưỡng miễn phí ship (VND)', updated_by: 1, updated_at: iso(30) },
    { key: 'vat_percent', value: '10', description: 'Thuế VAT mặc định (%)', updated_by: 1, updated_at: iso(90) },
    { key: 'points_per_10k', value: '1', description: 'Điểm tích lũy cho mỗi 10.000đ', updated_by: 1, updated_at: iso(90) },
    { key: 'maintenance_mode', value: 'false', description: 'Chế độ bảo trì', updated_by: 1, updated_at: iso(1) },
    { key: 'default_language', value: 'vi', description: 'Ngôn ngữ mặc định', updated_by: 1, updated_at: iso(90) }
  ];
}

// ═══════════════════════════════════════════════
// WRITE
// ═══════════════════════════════════════════════
const output = JSON.stringify(d, null, 2);
fs.writeFileSync(DEST, output, 'utf-8');

console.log('=== UPGRADE COMPLETE ===');
console.log('Output size:', output.length, 'bytes');
console.log('Collections:', Object.keys(d).length);
Object.keys(d).forEach(k => {
  const v = d[k];
  const c = Array.isArray(v) ? v.length + ' items' : typeof v;
  console.log(' ', k + ':', c);
});
