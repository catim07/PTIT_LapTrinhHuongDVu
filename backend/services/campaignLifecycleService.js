const DEFAULT_GRACE_HOURS = 24;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveLimit = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const pickFirstPositiveLimit = (entity, keys = []) => {
  for (const key of keys) {
    const value = toPositiveLimit(entity?.[key]);
    if (value !== null) return value;
  }
  return null;
};

const pickFirstCount = (entity, keys = []) => {
  for (const key of keys) {
    if (entity?.[key] !== undefined && entity?.[key] !== null) {
      return Math.max(0, toNumber(entity[key], 0));
    }
  }
  return 0;
};

export const computeCampaignLifecycle = (entity, options = {}) => {
  const now = options.now instanceof Date ? options.now : new Date();
  const limitKeys = options.limitKeys || ['total_quantity', 'max_redemptions', 'usage_limit'];
  const usedKeys = options.usedKeys || ['claimed_count', 'used_count', 'usage_count'];

  const totalQuantity = pickFirstPositiveLimit(entity, limitKeys);
  const consumedCount = pickFirstCount(entity, usedKeys);
  const remainingQuantity = totalQuantity === null ? null : Math.max(0, totalQuantity - consumedCount);

  const endDate = entity?.end_date ? new Date(entity.end_date) : null;
  const isExpired = Boolean(endDate && now > endDate);

  const graceHours = toPositiveLimit(entity?.hide_after_expired_hours) || DEFAULT_GRACE_HOURS;
  const graceUntil = endDate ? new Date(endDate.getTime() + (graceHours * 60 * 60 * 1000)) : null;
  const shouldHidePublic = Boolean(isExpired && graceUntil && now > graceUntil);
  const isSoldOut = Boolean(totalQuantity !== null && remainingQuantity !== null && remainingQuantity <= 0);

  return {
    total_quantity: totalQuantity,
    claimed_count: consumedCount,
    remaining_quantity: remainingQuantity,
    is_sold_out: isSoldOut,
    is_expired: isExpired,
    expired_grace_until: graceUntil ? graceUntil.toISOString() : null,
    should_hide_public: shouldHidePublic,
    is_visible_public: !shouldHidePublic,
  };
};

export const attachCampaignLifecycle = (entity, options = {}) => {
  if (!entity) return null;
  const base = entity.toObject ? entity.toObject() : { ...entity };
  return {
    ...base,
    ...computeCampaignLifecycle(base, options),
  };
};
