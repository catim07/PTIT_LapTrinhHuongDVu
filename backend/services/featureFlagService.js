// backend/services/featureFlagService.js
// ═══════════════════════════════════════════════════════
// Feature Flag System
// Store flags in MongoDB, allow dynamic enable/disable
// via admin API. Check flags in middleware or controllers.
// ═══════════════════════════════════════════════════════
import mongoose from 'mongoose';

const featureFlagSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  enabled: { type: Boolean, default: false },
  description: { type: String, default: '' },
  percentage: { type: Number, default: 100, min: 0, max: 100 }, // Gradual rollout
  allowed_roles: [{ type: Number }], // Empty = all roles
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  updated_by: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const FeatureFlag = mongoose.models.FeatureFlag || mongoose.model('FeatureFlag', featureFlagSchema);

// In-memory cache for fast lookups (refreshed periodically)
let flagCache = new Map();
let lastRefresh = 0;
const CACHE_TTL = 30000; // 30 seconds

async function refreshCache() {
  try {
    const flags = await FeatureFlag.find();
    const newCache = new Map();
    for (const flag of flags) {
      newCache.set(flag.key, {
        enabled: flag.enabled,
        percentage: flag.percentage,
        allowed_roles: flag.allowed_roles,
        metadata: flag.metadata,
      });
    }
    flagCache = newCache;
    lastRefresh = Date.now();
  } catch (err) {
    console.warn('[FeatureFlags] Cache refresh failed:', err.message);
  }
}

/**
 * Check if a feature is enabled
 * @param {string} key - Feature flag key
 * @param {object} context - Optional context { userId, roleId }
 * @returns {boolean}
 */
export async function isFeatureEnabled(key, context = {}) {
  // Refresh cache if stale
  if (Date.now() - lastRefresh > CACHE_TTL) {
    await refreshCache();
  }

  const flag = flagCache.get(key);
  if (!flag) return false;
  if (!flag.enabled) return false;

  // Check role-based access
  if (flag.allowed_roles && flag.allowed_roles.length > 0) {
    if (!context.roleId || !flag.allowed_roles.includes(context.roleId)) {
      return false;
    }
  }

  // Percentage-based rollout
  if (flag.percentage < 100) {
    if (!context.userId) return false;
    // Deterministic hash so same user always gets same result
    const hash = hashCode(String(context.userId) + key);
    if ((hash % 100) >= flag.percentage) {
      return false;
    }
  }

  return true;
}

/**
 * Simple hash function for deterministic rollout
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get all feature flags
 */
export async function getAllFlags() {
  return FeatureFlag.find().sort({ key: 1 });
}

/**
 * Create or update a feature flag
 */
export async function upsertFlag(key, data, updatedBy = '') {
  const flag = await FeatureFlag.findOneAndUpdate(
    { key },
    {
      key,
      enabled: data.enabled ?? false,
      description: data.description || '',
      percentage: data.percentage ?? 100,
      allowed_roles: data.allowed_roles || [],
      metadata: data.metadata || {},
      updated_by: updatedBy,
    },
    { upsert: true, new: true }
  );
  // Invalidate cache
  lastRefresh = 0;
  return flag;
}

/**
 * Delete a feature flag
 */
export async function deleteFlag(key) {
  await FeatureFlag.findOneAndDelete({ key });
  lastRefresh = 0;
}

/**
 * Express middleware to check feature flag
 * Usage: app.get('/route', requireFeature('new_checkout'), handler)
 */
export function requireFeature(flagKey) {
  return async (req, res, next) => {
    const enabled = await isFeatureEnabled(flagKey, {
      userId: req.userId,
      roleId: req.user?.role_id,
    });
    if (!enabled) {
      return res.status(403).json({
        success: false,
        message: 'Tính năng này hiện chưa được kích hoạt.',
        feature: flagKey,
      });
    }
    next();
  };
}

/**
 * Seed default feature flags (idempotent)
 */
export async function seedDefaultFlags() {
  const defaults = [
    { key: 'enable_flash_deals', enabled: true, description: 'Bật/tắt Flash Deals trên trang chủ' },
    { key: 'enable_ai_compare', enabled: true, description: 'Bật/tắt AI so sánh sản phẩm' },
    { key: 'enable_loyalty_points', enabled: true, description: 'Bật/tắt tích điểm thành viên' },
    { key: 'enable_qr_payment', enabled: true, description: 'Bật/tắt thanh toán QR' },
    { key: 'maintenance_mode', enabled: false, description: 'Bật chế độ bảo trì hệ thống' },
    { key: 'enable_product_reviews', enabled: true, description: 'Bật/tắt đánh giá sản phẩm' },
    { key: 'enable_backup_scheduler', enabled: true, description: 'Bật/tắt backup tự động hàng ngày' },
    { key: 'enable_notifications', enabled: true, description: 'Bật/tắt thông báo người dùng' },
  ];

  for (const flag of defaults) {
    const exists = await FeatureFlag.findOne({ key: flag.key });
    if (!exists) {
      await FeatureFlag.create(flag);
    }
  }
}
