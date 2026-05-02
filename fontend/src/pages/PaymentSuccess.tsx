import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order, UserAddress } from '../types';

const formatMoney = (value?: number | null) => Number(value ?? 0).toLocaleString('vi-VN');

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeState = (location.state as { order?: Order; address?: UserAddress; transactionId?: string | null }) || {};

  const [order, setOrder] = useState<any>(routeState.order || null);
  const [address, setAddress] = useState<any>(routeState.address || null);
  const [transactionId, setTransactionId] = useState<string>(routeState.transactionId || '');
  const [loading, setLoading] = useState(!routeState.order);
  const [error, setError] = useState<string | null>(null);

  // If route state is missing (e.g., page refresh), try to fetch order by ID from query params
  useEffect(() => {
    if (order) return; // Already have data from route state

    const orderId = searchParams.get('order_id') || searchParams.get('orderId');
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        console.log('[PaymentSuccess] Fetching order by ID:', orderId);
        const result = await orderService.getDetail(orderId);
        if (result) {
          setOrder(result);
          setAddress(result.order_address || null);
          setTransactionId(result.payment?.transaction_id || '');
        } else {
          setError('Không tìm thấy đơn hàng.');
        }
      } catch (err: any) {
        console.error('[PaymentSuccess] Fetch order failed:', err);
        setError('Không thể tải thông tin đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [order, searchParams]);

  console.log('[PaymentSuccess] order:', order, 'address:', address, 'transactionId:', transactionId);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4">
        <div className="animate-pulse flex space-x-4 mb-4">
          <div className="rounded-full bg-slate-200 h-16 w-16"></div>
        </div>
        <p className="text-slate-500 mb-6">Đang tải thông tin đơn hàng...</p>
        <Link to="/" className="text-primary hover:underline font-medium">Bấm vào đây để về trang chủ nếu quá lâu</Link>
      </div>
    );
  }

  // No order data — show a friendly fallback instead of crashing
  if (!order) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
        <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 lg:px-40">
          <div className="max-w-[600px] w-full flex flex-col items-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-lg">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Thanh toán thành công</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Cảm ơn bạn đã mua sắm!</p>

            {error && (
              <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-sm text-amber-700 dark:text-amber-300">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full mb-12">
              <Link to="/account/orders" className="flex-1 bg-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                <span className="material-symbols-outlined">receipt_long</span> Xem đơn hàng
              </Link>
              <Link to="/products" className="flex-1 bg-primary/10 text-primary font-bold py-4 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                <span className="material-symbols-outlined">shopping_cart</span> Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe accessors for all potentially undefined fields
  const orderId = order?.id || order?._id || 'Đang cập nhật';
  const paymentMethod = (order?.payment_method || order?.payment?.method || 'COD');
  const totalAmount = order?.total_amount ?? order?.pricing_breakdown?.final_total ?? 0;
  const orderAddress = address || order?.order_address || {};

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 lg:px-40">
        <div className="max-w-[600px] w-full flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-lg">
            <span className="material-symbols-outlined text-6xl">check_circle</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Thanh toán thành công</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Cảm ơn bạn đã mua sắm! Đơn hàng của bạn đang được xử lý.</p>

          <div className="w-full bg-white dark:bg-white/5 rounded-xl border border-primary/5 p-6 shadow-sm mb-8">
            <h3 className="text-left font-bold text-lg mb-4 border-b border-primary/5 pb-2">Chi tiết đơn hàng</h3>
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Mã đơn hàng</span>
                <span className="font-semibold text-primary">#{orderId}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Phương thức thanh toán</span>
                <span className="font-medium">{String(paymentMethod).toUpperCase()}{transactionId ? ` (${transactionId})` : ''}</span>
              </div>

              {(order?.subtotal != null || order?.pricing_breakdown?.subtotal != null) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Tạm tính</span>
                  <span className="font-medium">{formatMoney(order?.subtotal ?? order?.pricing_breakdown?.subtotal)}đ</span>
                </div>
              )}

              {(Number(order?.shipping_fee ?? order?.pricing_breakdown?.shipping_fee ?? 0) > 0) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Phí vận chuyển</span>
                  <span className="font-medium">{formatMoney(order?.shipping_fee ?? order?.pricing_breakdown?.shipping_fee)}đ</span>
                </div>
              )}

              {(Number(order?.discount_amount ?? order?.pricing_breakdown?.coupon_discount ?? 0) > 0) && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-medium">-{formatMoney(order?.discount_amount ?? order?.pricing_breakdown?.coupon_discount)}đ</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tổng cộng</span>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{formatMoney(totalAmount)}đ</span>
              </div>

              <div className="flex justify-between items-start text-sm gap-4">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">Địa chỉ giao hàng</span>
                <span className="text-right">
                  {orderAddress?.full_address || [orderAddress?.street, orderAddress?.ward, orderAddress?.district, orderAddress?.city].filter(Boolean).join(', ') || 'Chưa có thông tin'}
                </span>
              </div>

              {(Number(order?.points_earned ?? order?.pricing_breakdown?.points_earned ?? 0) > 0) && (
                <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 dark:bg-green-900/10 rounded-lg p-2 mt-2">
                  <span className="font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">stars</span> L.Point tích lũy
                  </span>
                  <span className="font-bold">+{formatMoney(order?.points_earned ?? order?.pricing_breakdown?.points_earned)} điểm</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mb-12">
            <Link to={`/account/orders/${orderId}`} className="flex-1 bg-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
              <span className="material-symbols-outlined">receipt_long</span> Xem đơn hàng
            </Link>
            <Link to="/products" className="flex-1 bg-primary/10 text-primary font-bold py-4 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
              <span className="material-symbols-outlined">shopping_cart</span> Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;