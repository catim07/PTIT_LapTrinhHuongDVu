import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const paymentMethodSchema = new mongoose.Schema(
  {
    type: { type: String, default: '' },
    last4: { type: String, default: '' },
    brand: { type: String, default: '' },
    card_id: { type: String, default: '' },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  full_name: { type: String, default: '' },
  email: { type: String, default: undefined, lowercase: true, trim: true },
  phone: {
    type: String,
    default: '',
    set: (value) => String(value ?? '').trim(),
  },
  password_hash: { type: String, default: null },
  avatar: { type: String, default: null },
  role_id: { type: Number, default: 3 }, // 1=superadmin, 2=admin, 3=user
  role_key: { type: String, default: null },
  permissions: { type: [String], default: [] },
  branch_id: { type: mongoose.Schema.Types.Mixed, default: null },
  lotte_points: { type: Number, default: 0 },
  membership_level: { type: String, default: 'Đồng', enum: ['Đồng', 'Bạc', 'Vàng', 'Kim Cương'] },
  signup_method: { type: String, default: 'email' },
  login_provider: { type: String, default: 'local', enum: ['local', 'google', 'facebook', 'phone'] },
  googleId: { type: String, default: null },
  facebookId: { type: String, default: null },
  facebook_id: { type: String, default: null },
  social_providers: [{ provider: String, provider_user_id: String }],
  social_links: { facebook: { type: String, default: null }, google: { type: String, default: null } },
  status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'LOCKED'] },
  is_active: { type: Boolean, default: true },
  profile_completed: { type: Boolean, default: false },
  wallet_balance: { type: Number, default: 0 },
  default_payment_method: {
    type: paymentMethodSchema,
    default: null,
  },
  email_verified: { type: Boolean, default: false },
  email_verification_code: { type: String, default: null },
  email_verification_expires_at: { type: Date, default: null },
  email_verification_attempts: { type: Number, default: 0 },
  email_otp_last_sent_at: { type: Date, default: null },
  dob: { type: String, default: null },
  gender: { type: String, default: null },
  address: { type: String, default: null },
  bio: { type: String, default: null },
  note: { type: String, default: '' },
  tags: [String],
  preferences: {
    newsletter: { type: Boolean, default: true },
    sms_alerts: { type: Boolean, default: true },
    language: { type: String, default: 'vi' },
    receive_promotions: { type: Boolean, default: true },
    eco_prefer: { type: Boolean, default: false },
    favorite_categories: [{ type: Number }],
    preferred_store: { type: Number, default: null },
    notification_email_promo: { type: Boolean, default: true },
    notification_sms_order: { type: Boolean, default: true },
    notification_push_order: { type: Boolean, default: true },
    notification_promo: { type: Boolean, default: true },
    notification_system: { type: Boolean, default: true },
  },
  security: {
    two_factor_enabled: { type: Boolean, default: false },
    last_login_device: { type: String, default: '' },
    last_login_at: { type: Date, default: null },
  },
  settings: {
    language: { type: String, default: 'vi' },
    dark_mode: { type: Boolean, default: false },
    privacy_profile_visible: { type: Boolean, default: true },
    marketing_opt_in: { type: Boolean, default: true },
    sms_opt_in: { type: Boolean, default: true },
  },
  last_login_at: { type: Date, default: null },
  refresh_token: { type: String, default: null },
  is_deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Soft Delete Middleware
userSchema.pre('find', function() {
  if (this.getQuery().is_deleted === undefined) {
    this.where({ is_deleted: { $ne: true } });
  }
});
userSchema.pre('findOne', function() {
  if (this.getQuery().is_deleted === undefined) {
    this.where({ is_deleted: { $ne: true } });
  }
});
userSchema.pre('countDocuments', function() {
  if (this.getQuery().is_deleted === undefined) {
    this.where({ is_deleted: { $ne: true } });
  }
});

// Allow multiple users without email while keeping real emails unique.
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string', $ne: '' } } },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash') || !this.password_hash) return next();
  if (this.password_hash.startsWith('$2')) return next(); // already hashed
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password_hash) return false;
  return bcrypt.compare(candidate, this.password_hash);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.refresh_token;
  delete obj.email_verification_code;
  delete obj.email_verification_expires_at;
  delete obj.email_verification_attempts;
  delete obj.email_otp_last_sent_at;
  delete obj.__v;
  obj.phone = String(obj.phone || '');
  obj.id = obj._id;
  return obj;
};

export default mongoose.model('User', userSchema);
