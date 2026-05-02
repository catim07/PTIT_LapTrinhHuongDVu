import Notification from '../models/Notification.js';
import { enqueueJob } from './queueService.js';

export const processNotificationJob = async (data) => {
  const { userId, title, message, type, icon, link, metadata } = data;
  if (!userId || !title) return null;

  try {
    const created = await Notification.create({
      user_id: userId,
      title: String(title),
      message: String(message || ''),
      type,
      icon,
      link,
      is_read: false,
      metadata,
    });

    if (global.io) {
      global.io.to(`user_${userId}`).emit('new_notification', created);
    }

    return created;
  } catch (err) {
    console.error('Failed to process notification job', err);
    throw err;
  }
};

export const createUserNotification = async (data) => {
  if (!data.userId || !data.title) return null;
  // Fire and forget via Queue
  enqueueJob('notification', 'create_notification', data).catch(err => {
    console.error('Failed to enqueue notification', err);
  });
  return true;
};

const ORDER_STATUS_LABELS = {
  PENDING: 'Dang cho xac nhan',
  CONFIRMED: 'Da xac nhan',
  PROCESSING: 'Dang chuan bi hang',
  SHIPPING: 'Dang giao hang',
  DELIVERED: 'Da giao hang',
  CANCELLED: 'Da huy',
  RETURNED: 'Da hoan tra',
};

export const notifyOrderStatusChanged = async ({
  userId,
  orderId,
  status,
  note = '',
}) => {
  const statusLabel = ORDER_STATUS_LABELS[String(status || '').toUpperCase()] || String(status || 'Unknown');
  return createUserNotification({
    userId,
    title: `Don hang #${orderId} cap nhat`,
    message: note ? `${statusLabel}. ${note}` : `Trang thai moi: ${statusLabel}`,
    type: 'order',
    icon: 'local_shipping',
    link: `/account/orders/${orderId}`,
    metadata: {
      order_id: String(orderId),
      status: String(status || ''),
    },
  });
};

export const notifyPointsEarned = async ({
  userId,
  points,
  orderId = null,
  newBalance = null,
}) => {
  return createUserNotification({
    userId,
    title: `Ban vua nhan ${Number(points || 0).toLocaleString('vi-VN')} L.Point`,
    message: newBalance !== null
      ? `So du hien tai: ${Number(newBalance || 0).toLocaleString('vi-VN')} L.Point`
      : 'Diem thuong da duoc cap nhat.',
    type: 'loyalty',
    icon: 'military_tech',
    link: '/account/loyalty',
    metadata: {
      points: Number(points || 0),
      order_id: orderId ? String(orderId) : null,
      new_balance: newBalance,
    },
  });
};

export const notifyPointsAdjusted = async ({
  userId,
  delta,
  newBalance,
  reason = '',
}) => {
  const amount = Number(delta || 0);
  const increase = amount >= 0;
  return createUserNotification({
    userId,
    title: increase
      ? `Ban duoc cong ${amount.toLocaleString('vi-VN')} L.Point`
      : `Ban bi tru ${Math.abs(amount).toLocaleString('vi-VN')} L.Point`,
    message: reason
      ? `${reason}. So du hien tai: ${Number(newBalance || 0).toLocaleString('vi-VN')} L.Point`
      : `So du hien tai: ${Number(newBalance || 0).toLocaleString('vi-VN')} L.Point`,
    type: 'loyalty',
    icon: 'military_tech',
    link: '/account/loyalty',
    metadata: {
      delta: amount,
      new_balance: Number(newBalance || 0),
      reason,
    },
  });
};

export const notifyPaymentSuccess = async ({ userId, orderId, amount }) => {
  return createUserNotification({
    userId,
    title: 'Thanh toan thanh cong',
    message: `Don hang #${orderId} da duoc thanh toan ${Number(amount || 0).toLocaleString('vi-VN')}d`,
    type: 'payment',
    icon: 'check_circle',
    link: `/account/orders/${orderId}`,
    metadata: { order_id: String(orderId), amount: Number(amount || 0), event: 'payment_success' },
  });
};

export const notifyPaymentFailed = async ({ userId, orderId, reason = '' }) => {
  return createUserNotification({
    userId,
    title: 'Thanh toan that bai',
    message: reason || `Don hang #${orderId} chua duoc thanh toan. Vui long thu lai.`,
    type: 'payment',
    icon: 'error',
    link: `/account/orders/${orderId}`,
    metadata: { order_id: String(orderId), event: 'payment_failed', reason },
  });
};
