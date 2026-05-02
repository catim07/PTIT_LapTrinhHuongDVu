import { calculateCheckoutTotals } from '../services/promotionCalculationService.js';

const normalizePayload = (body) => {
  const cartItems = body?.cartItems || body?.cart?.items || body?.items || [];
  return {
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    branchId: body?.branchId || body?.branch_id || body?.cart?.branchId || body?.cart?.branch_id || null,
    couponCode: body?.couponCode || body?.coupon_code || null,
    shippingFeeBase: body?.shippingFeeBase,
  };
};

export const calculate = async (req, res) => {
  try {
    const { cartItems, branchId, couponCode, shippingFeeBase } = normalizePayload(req.body);
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const breakdown = await calculateCheckoutTotals({
      cartItems,
      branchId,
      couponCode,
      shippingFeeBase,
      userId,
    });

    return res.json({ success: true, data: breakdown });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const preview = async (req, res) => {
  try {
    const { cartItems, branchId, couponCode, shippingFeeBase } = normalizePayload(req.body);
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const breakdown = await calculateCheckoutTotals({
      cartItems,
      branchId,
      couponCode,
      shippingFeeBase,
      userId,
    });

    return res.json({
      success: true,
      data: breakdown,
      message: 'Checkout preview generated',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
