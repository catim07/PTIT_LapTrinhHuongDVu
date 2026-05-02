import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendOrderSuccessEmail } from './emailService.js';
import { enqueueJob } from './queueService.js';

const lockOrderForEmailSend = async (orderId) => {
  if (!orderId) return null;
  return Order.findOneAndUpdate(
    {
      _id: orderId,
      email_notification_status: { $nin: ['SENT', 'SENDING'] },
    },
    {
      $set: {
        email_notification_status: 'SENDING',
        email_notification_error: null,
      },
    },
    { new: true },
  );
};

export const processEmailJob = async ({ orderId }) => {
  if (!orderId) return;

  const order = await lockOrderForEmailSend(orderId);
  if (!order) return;

  const user = await User.findById(order.user_id);
  if (!user || !user.email || user.email_verified !== true) {
    await Order.findByIdAndUpdate(orderId, {
      email_notification_status: 'SKIPPED',
      email_notification_error: 'Email missing or not verified',
    });
    return;
  }

  try {
    console.log('ORDER SUCCESS - START SEND EMAIL');
    await sendOrderSuccessEmail(user, order);
    console.log('EMAIL SENT SUCCESS');

    await Order.findByIdAndUpdate(orderId, {
      email_notification_status: 'SENT',
      email_notification_sent_at: new Date(),
      email_notification_error: null,
    });
  } catch (err) {
    console.error('EMAIL SEND FAILED:', err);
    await Order.findByIdAndUpdate(orderId, {
      email_notification_status: 'FAILED',
      email_notification_error: err.message,
    });
    throw err; // For BullMQ retries
  }
};

export const sendOrderSuccessEmailIfNeeded = async (orderId) => {
  await enqueueJob('email', 'order_success_email', { orderId });
};

export const queueOrderSuccessEmail = (orderId) => {
  enqueueJob('email', 'order_success_email', { orderId }).catch(err => {
    console.error('[OrderEmail] enqueue error:', err.message);
  });
};

export default {
  queueOrderSuccessEmail,
  sendOrderSuccessEmailIfNeeded,
  processEmailJob,
};
