import Notification from '../models/Notification.js';
import User from '../models/User.js';

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export const broadcastNotificationToActiveUsers = async ({
  title,
  message,
  type = 'info',
  icon = 'info',
  link = null,
  metadata = {},
  createdBy = null,
}) => {
  if (!title || !String(title).trim()) return 0;

  const users = await User.find({
    is_active: true,
    status: { $ne: 'LOCKED' },
    $or: [
      { 'preferences.receive_promotions': { $exists: false } },
      { 'preferences.receive_promotions': true },
    ],
  }).select('_id').lean();

  if (!users.length) return 0;

  const docs = users.map((user) => ({
    user_id: user._id,
    title: String(title).trim(),
    message: String(message || '').trim(),
    type,
    icon,
    link,
    is_read: false,
    metadata: {
      ...metadata,
      created_by: createdBy || null,
      audience: 'all_active_users',
    },
  }));

  const groups = chunk(docs, 500);
  for (const group of groups) {
    await Notification.insertMany(group, { ordered: false });
  }

  return docs.length;
};

export const broadcastCampaignCreated = async ({
  campaignType,
  campaignId,
  title,
  description,
  link,
  createdBy,
}) => {
  const normalizedType = String(campaignType || 'promotion').toLowerCase();
  const campaignLabel = normalizedType === 'coupon' ? 'coupon mới' : 'khuyến mãi mới';

  const messageBody = String(description || '').trim();
  const message = messageBody
    ? `${campaignLabel.toUpperCase()}: ${messageBody}`
    : `Hệ thống vừa có ${campaignLabel}. Khám phá ngay để không bỏ lỡ ưu đãi.`;

  return broadcastNotificationToActiveUsers({
    title: title || `Thong bao ${campaignLabel}`,
    message,
    type: normalizedType,
    icon: normalizedType === 'coupon' ? 'sell' : 'local_offer',
    link: link || (normalizedType === 'coupon' ? '/my-coupons' : '/promotions'),
    createdBy,
    metadata: {
      campaign_type: normalizedType,
      campaign_id: campaignId || null,
    },
  });
};
