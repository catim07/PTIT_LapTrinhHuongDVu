import mongoose from 'mongoose';
import { PaymentMethod, PaymentTransaction, PaymentProvider } from '../models/Payment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { LoyaltyTransaction } from '../models/Loyalty.js';
import { queueOrderSuccessEmail } from '../services/orderEmailService.js';
import { isValidVietnamPhone, normalizeVietnamPhone } from '../utils/validatePhone.js';
import { notifyOrderStatusChanged, notifyPointsEarned, notifyPaymentSuccess, notifyPaymentFailed } from '../services/userNotificationService.js';
import inventoryService from '../services/inventoryService.js';

// ─── Membership tier helper ───
const MEMBERSHIP_TIERS = [
  { name: 'Đồng', minPoints: 0 },
  { name: 'Bạc', minPoints: 100 },
  { name: 'Vàng', minPoints: 500 },
  { name: 'Kim Cương', minPoints: 2000 },
];

const calculateMembershipTier = (totalPoints) => {
  let tier = 'Đồng';
  for (const t of MEMBERSHIP_TIERS) {
    if (totalPoints >= t.minPoints) tier = t.name;
  }
  return tier;
};

export const methods = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role_id !== 3 && req.query.user_id) filter.user_id = req.query.user_id;
    else filter.user_id = req.userId;
    const raw = await PaymentMethod.find(filter);
    // Normalize: map _id → id for frontend consumption
    const data = raw.map(m => {
      const o = m.toObject();
      o.id = o.id || String(o._id);
      return o;
    });
    return res.json({ success: true, data });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const addMethod = async (req, res) => {
  try {
    const userId = (req.user?.role_id !== 3 && req.body.user_id) ? req.body.user_id : req.userId;
    if (req.body.is_default) await PaymentMethod.updateMany({ user_id: userId }, { is_default: false });
    return res.status(201).json({ success: true, data: await PaymentMethod.create({ ...req.body, user_id: userId }) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const updateMethod = async (req, res) => {
  try {
    const m = await PaymentMethod.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user?.role_id === 3 && String(m.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    const updated = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const deleteMethod = async (req, res) => {
  try {
    const m = await PaymentMethod.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user?.role_id === 3 && String(m.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    await PaymentMethod.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const setDefault = async (req, res) => {
  try {
    const pm = await PaymentMethod.findById(req.params.id);
    if (!pm) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user?.role_id === 3 && String(pm.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    await PaymentMethod.updateMany({ user_id: pm.user_id }, { is_default: false });
    pm.is_default = true; await pm.save();
    return res.json({ success: true, data: pm });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/payments/process
// Creates a PENDING payment transaction with QR data
export const process = async (req, res) => {
  try {
    const userId = (req.user?.role_id !== 3 && req.body.user_id) ? req.body.user_id : req.userId;
    const orderId = req.body.order_id;
    const amount = req.body.amount || 0;

    const checkoutUser = await User.findById(userId);
    if (!checkoutUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const normalizedPhone = normalizeVietnamPhone(checkoutUser.phone || '');
    if (!normalizedPhone || !isValidVietnamPhone(normalizedPhone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ hoặc chưa cập nhật' });
    }

    // Validate order_id before creating payment session
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      console.error('[PaymentController] process: order_id is missing or invalid from request body. Received:', req.body.order_id);
      return res.status(400).json({ success: false, message: 'order_id is required and must be valid to create payment session' });
    }

    console.log('[PaymentController] Creating payment session for order:', orderId, 'amount:', amount, 'user:', userId);

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 15 minute expiry
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    // VietQR-style mock data
    const qrData = {
      bank: 'MB Bank (Ngân hàng Quân Đội)',
      account_name: 'CONG TY TNHH LOTTE MART VN',
      account_number: '0851000386868',
      amount: amount,
      description: transactionId,
      qr_url: `https://img.vietqr.io/image/MB-0851000386868-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transactionId)}&accountName=${encodeURIComponent('CONG TY TNHH LOTTE MART VN')}`,
    };

    const tx = await PaymentTransaction.create({
      order_id: orderId,
      user_id: userId,
      provider: req.body.provider || 'BANK_TRANSFER',
      method_id: req.body.method_id || '',
      transaction_id: transactionId,
      amount,
      currency: req.body.currency || 'VND',
      status: 'PENDING',
      qr_data: qrData,
      expired_at: expiredAt,
    });

    console.log('[PaymentController] Created PENDING transaction:', {
      _id: tx._id,
      transaction_id: tx.transaction_id,
      order_id: tx.order_id,
      user_id: tx.user_id,
      amount: tx.amount,
      status: tx.status,
    });

    // Build response with qrData at top level for easy frontend access
    const responseData = tx.toObject();
    responseData.id = String(tx._id);
    responseData.qrData = {
      bank: qrData.bank,
      accountName: qrData.account_name,
      accountNumber: qrData.account_number,
      amount: qrData.amount,
      description: qrData.description,
      qrUrl: qrData.qr_url,
    };

    return res.json({ success: true, data: responseData, message: 'Đã tạo phiên thanh toán' });
  } catch (err) {
    console.error('[PaymentController] process error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/:id/confirm
// Confirms payment: updates status, updates order, awards loyalty points, updates membership tier
export const confirm = async (req, res) => {
  try {
    const txId = req.params.id;

    // Validate transaction ID
    if (!txId || txId === 'undefined' || txId === 'null') {
      console.error('[PaymentController] confirm: Invalid transaction ID:', txId);
      return res.status(400).json({ success: false, message: 'Transaction ID is required and must be valid' });
    }

    console.log('[PaymentController] Confirming payment for transaction:', txId);

    const tx = await PaymentTransaction.findById(txId);
    if (!tx) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán' });

    // Prevent double-confirm
    if (tx.status === 'COMPLETED' || tx.status === 'PAID') {
      console.log('[PaymentController] Transaction already confirmed:', txId);
      if (tx.order_id && mongoose.isValidObjectId(String(tx.order_id))) {
        try {
          const existingOrder = await Order.findById(String(tx.order_id));
          if (existingOrder?._id) {
            queueOrderSuccessEmail(existingOrder._id);
          }
        } catch (err) {
          console.error('EMAIL SEND FAILED:', err);
        }
      }
      return res.json({
        success: true,
        data: {
          transaction: tx,
          points_earned: 0,
          already_confirmed: true,
        },
        message: 'Giao dịch đã được xác nhận trước đó'
      });
    }

    // Check expiry
    if (tx.expired_at && new Date() > tx.expired_at) {
      tx.status = 'FAILED';
      await tx.save();
      return res.status(400).json({ success: false, message: 'Phiên thanh toán đã hết hạn. Vui lòng tạo giao dịch mới.' });
    }

    // Mark as paid
    tx.status = 'COMPLETED';
    tx.paid_at = new Date();
    await tx.save();

    console.log('[PaymentController] Confirmed transaction:', tx._id, 'for order:', tx.order_id);

    let pointsEarned = 0;
    let orderTotalAmount = tx.amount || 0;
    let membershipLevel = null;

    // Update order status and payment info
    // CRITICAL: validate order_id is a real ObjectId before querying to prevent CastError
    const orderIdStr = tx.order_id ? String(tx.order_id) : '';
    const hasValidOrderId = orderIdStr 
      && orderIdStr !== 'undefined' 
      && orderIdStr !== 'null' 
      && orderIdStr.length > 0
      && mongoose.isValidObjectId(orderIdStr);

    console.log('[PaymentController] order_id from transaction:', tx.order_id, '→ valid:', hasValidOrderId);

    if (hasValidOrderId) {
      try {
        const order = await Order.findById(orderIdStr);
        if (order) {
          const previousStatus = order.status;
          order.payment_status = 'PAID';
          if (order.status === 'PENDING') order.status = 'CONFIRMED';
          if (order.payment) {
            order.payment.status = 'PAID';
            order.payment.transaction_id = tx.transaction_id;
          } else {
            order.payment = {
              method: tx.provider || 'BANK_TRANSFER',
              status: 'PAID',
              transaction_id: tx.transaction_id,
            };
          }

          orderTotalAmount = order.total_amount || tx.amount || 0;

          // CRITICAL: Amount validation
          // If order exists, transaction amount must match order total amount
          if (tx.amount < orderTotalAmount) {
            return res.status(400).json({ success: false, message: 'Số tiền thanh toán không khớp với tổng đơn hàng' });
          }

          // Calculate loyalty points: 10,000 VND = 1 point
          pointsEarned = Math.floor(orderTotalAmount / 10000);
          order.points_earned = pointsEarned;
          await order.save();
          queueOrderSuccessEmail(order._id);

          if (previousStatus !== order.status) {
            try {
              await notifyOrderStatusChanged({
                userId: order.user_id,
                orderId: String(order._id),
                status: order.status,
                note: 'Thanh toán đã xác nhận thành công',
              });
            } catch (notifyErr) {
              console.warn('[PaymentController] order status notification failed:', notifyErr.message);
            }
          }

          console.log('[PaymentController] Updated order:', order._id, 'status:', order.status, 'payment_status:', order.payment_status, 'points_earned:', pointsEarned);
        } else {
          console.warn('[PaymentController] Order not found for id:', orderIdStr);
          // Fallback: calculate from transaction amount
          pointsEarned = Math.floor((tx.amount || 0) / 10000);
        }
      } catch(orderErr) {
        console.error('[PaymentController] Error updating order:', orderErr.message, 'order_id:', orderIdStr);
        // Fallback: calculate from transaction amount
        pointsEarned = Math.floor((tx.amount || 0) / 10000);
      }
    } else {
      console.warn('[PaymentController] No valid order_id on transaction:', tx._id, 'raw order_id:', tx.order_id);
      // No order_id — calculate from transaction amount
      pointsEarned = Math.floor((tx.amount || 0) / 10000);
    }

    // Award loyalty points — with dedup by order_id
    const userIdStr = tx.user_id ? String(tx.user_id) : '';
    const hasValidUserId = userIdStr && userIdStr !== 'undefined' && userIdStr !== 'null' && mongoose.isValidObjectId(userIdStr);
    
    if (pointsEarned > 0 && hasValidUserId) {
      try {
        // Check for duplicate: don't award points twice for the same order
        let alreadyAwarded = false;
        if (tx.order_id) {
          const existingTx = await LoyaltyTransaction.findOne({
            user_id: tx.user_id,
            order_id: tx.order_id,
            type: 'earn',
            source: 'purchase',
          });
          if (existingTx) {
            console.log('[PaymentController] Points already awarded for order:', tx.order_id, '— skipping');
            alreadyAwarded = true;
            pointsEarned = 0; // Don't award again
          }
        }

        if (!alreadyAwarded) {
          const user = await User.findById(userIdStr);
          if (user) {
            const previousBalance = user.lotte_points || 0;
            user.lotte_points = previousBalance + pointsEarned;

            // Update membership tier based on new total points
            const newTier = calculateMembershipTier(user.lotte_points);
            const oldTier = user.membership_level || 'Đồng';
            user.membership_level = newTier;
            membershipLevel = newTier;

            await user.save();

            await LoyaltyTransaction.create({
              user_id: user._id,
              type: 'earn',
              points: pointsEarned,
              source: 'purchase',
              description: `Tích điểm từ đơn hàng #${tx.order_id || tx.transaction_id} (${orderTotalAmount.toLocaleString('vi-VN')}đ)`,
              order_id: tx.order_id || null,
              balance_after: user.lotte_points,
            });

            try {
              await notifyPointsEarned({
                userId: user._id,
                points: pointsEarned,
                orderId: tx.order_id || null,
                newBalance: user.lotte_points,
              });
            } catch (notifyErr) {
              console.warn('[PaymentController] loyalty notification failed:', notifyErr.message);
            }

            console.log('[PaymentController] Awarded', pointsEarned, 'points to user:', user._id, 
              'new balance:', user.lotte_points, 
              'tier:', oldTier, '→', newTier);
          }
        }
      } catch(loyaltyErr) {
        console.error('[PaymentController] Error awarding loyalty points:', loyaltyErr.message);
        // Don't fail the payment confirmation if loyalty fails
      }
    }

    // Send payment success notification
    try {
      await notifyPaymentSuccess({ userId: tx.user_id, orderId: tx.order_id, amount: orderTotalAmount });
    } catch (notifyErr) {
      console.warn('[PaymentController] payment success notification failed:', notifyErr.message);
    }

    return res.json({
      success: true,
      data: {
        transaction: tx,
        points_earned: pointsEarned,
        membership_level: membershipLevel,
        total_amount: orderTotalAmount,
      },
      message: 'Thanh toán đã được xác nhận thành công',
    });
  } catch (err) {
    console.error('[PaymentController] confirm error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/:id/fail
// Marks a payment as failed, restores inventory, notifies user
export const fail = async (req, res) => {
  let session = null;
  try {
    const tx = await PaymentTransaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    if (['COMPLETED', 'PAID'].includes(tx.status)) {
      return res.status(400).json({ success: false, message: 'Không thể hủy giao dịch đã hoàn thành' });
    }
    if (tx.status === 'FAILED') {
      return res.json({ success: true, data: tx, message: 'Giao dịch đã ở trạng thái thất bại' });
    }

    tx.status = 'FAILED';
    tx.metadata = { ...(tx.metadata || {}), fail_reason: req.body.reason || 'Payment failed', failed_at: new Date() };
    await tx.save();

    // Restore inventory if order exists
    const orderIdStr = tx.order_id ? String(tx.order_id) : '';
    if (orderIdStr && mongoose.isValidObjectId(orderIdStr)) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        const order = await Order.findById(orderIdStr).session(session);
        if (order && order.status === 'PENDING') {
          await inventoryService.restoreInventoryFromOrder(order.items, session);
          order.status = 'CANCELLED';
          order.payment.status = 'FAILED';
          order.tracking.history.push({ status: 'CANCELLED', note: 'Thanh toán thất bại — tự động hủy', timestamp: new Date() });
          await order.save({ session });
        }
        await session.commitTransaction();
        session.endSession();
        session = null;
      } catch (orderErr) {
        if (session) { await session.abortTransaction(); session.endSession(); session = null; }
        console.error('[PaymentController] fail: order restore error:', orderErr.message);
      }
    }

    // Notify user
    try {
      await notifyPaymentFailed({ userId: tx.user_id, orderId: tx.order_id, reason: req.body.reason || '' });
    } catch (notifyErr) {
      console.warn('[PaymentController] payment fail notification error:', notifyErr.message);
    }

    return res.json({ success: true, data: tx, message: 'Giao dịch đã được đánh dấu thất bại' });
  } catch (err) {
    if (session) { await session.abortTransaction(); session.endSession(); }
    console.error('[PaymentController] fail error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/:id/cancel
export const cancelPayment = async (req, res) => {
  try {
    const tx = await PaymentTransaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    if (['COMPLETED', 'PAID'].includes(tx.status)) {
      return res.status(400).json({ success: false, message: 'Không thể hủy giao dịch đã hoàn thành' });
    }
    tx.status = 'CANCELLED';
    await tx.save();
    return res.json({ success: true, data: tx, message: 'Đã hủy giao dịch thanh toán' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const transactions = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role_id !== 3 && req.query.user_id) filter.user_id = req.query.user_id;
    else filter.user_id = req.userId;
    return res.json({ success: true, data: await PaymentTransaction.find(filter).sort('-created_at') });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const providers = async (req, res) => {
  try { return res.json({ success: true, data: await PaymentProvider.find() }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const updateProviders = async (req, res) => {
  try {
    const { providers: list } = req.body;
    if (Array.isArray(list)) {
      for (const p of list) {
        if (p._id) await PaymentProvider.findByIdAndUpdate(p._id, p);
        else await PaymentProvider.create(p);
      }
    }
    return res.json({ success: true, data: await PaymentProvider.find() });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const status = async (req, res) => {
  try {
    const tx = await PaymentTransaction.findById(req.params.id);
    return tx ? res.json({ success: true, data: tx }) : res.status(404).json({ success: false, message: 'Not found' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
