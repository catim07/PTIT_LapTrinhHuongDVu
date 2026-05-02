import Notification from '../models/Notification.js';
import { broadcastNotificationToActiveUsers } from '../services/notificationBroadcastService.js';

const normalizeNotification = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id;
  return obj;
};

// GET /api/notifications
export const list = async (req, res) => {
  try {
    const roleId = Number(req.user?.role_id);
    const filter = {};
    if (roleId !== 3 && req.query.user_id) filter.user_id = req.query.user_id;
    else filter.user_id = req.userId;
    const data = await Notification.find(filter).sort('-created_at').limit(100);
    return res.json({ success: true, data: data.map(normalizeNotification) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/unread-count
export const unreadCount = async (req, res) => {
  try {
    const userId = (Number(req.user?.role_id) !== 3 && req.query.user_id) ? req.query.user_id : req.userId;
    const count = await Notification.countDocuments({ user_id: userId, is_read: false });
    return res.json({ success: true, data: { count } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
    if (Number(req.user?.role_id) === 3 && String(notif.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    notif.is_read = true;
    await notif.save();
    return res.json({ success: true, data: normalizeNotification(notif) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    const userId = (Number(req.user?.role_id) !== 3 && req.body.user_id) ? req.body.user_id : req.userId;
    await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });
    return res.json({ success: true, message: 'Đã đọc tất cả' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id
export const remove = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
    if (Number(req.user?.role_id) === 3 && String(notif.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    await Notification.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Đã xóa thông báo' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notifications/broadcast
export const broadcast = async (req, res) => {
  try {
    const { title, message, type, icon, link, metadata } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const createdCount = await broadcastNotificationToActiveUsers({
      title: String(title).trim(),
      message: String(message || '').trim(),
      type: type || 'system',
      icon: icon || 'campaign',
      link: link || null,
      metadata: metadata || {},
      createdBy: req.user?._id || req.user?.id || null,
    });

    return res.status(201).json({
      success: true,
      data: { delivered_count: createdCount },
      message: `Đã gửi thông báo đến ${createdCount} người dùng`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
