import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '../types';

const OrderTracking: React.FC = () => {
    const { orderId: pathOrderId } = useParams<{ orderId?: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderIdParam = queryParams.get('id') || pathOrderId || '';
    const [order, setOrder] = React.useState<Order | null>(null);
    const [trackingData, setTrackingData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      const fetchTracking = async () => {
        if (!orderIdParam) {
          setError('Thiếu mã đơn hàng để theo dõi');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        try {
          const [trackRes, orderRes] = await Promise.all([
            orderService.trackOrder(orderIdParam),
            orderService.getDetail(orderIdParam)
          ]);
          setTrackingData(trackRes);
          setOrder(orderRes || null);
        } catch (e: any) {
          setError(e?.message || 'Không thể tải dữ liệu theo dõi đơn hàng');
        } finally {
          setIsLoading(false);
        }
      };

      fetchTracking();
    }, [orderIdParam]);

    if (isLoading) {
      return <div className="p-10 text-center"><p>Đang tải thông tin theo dõi...</p></div>;
    }

    if (error) {
      return <div className="p-10 text-center"><p>{error}</p></div>;
    }

    if (!trackingData && !order) {
        return <div className="p-10 text-center"><p>Không tìm thấy đơn hàng</p></div>;
    }

    const tracking = trackingData || order?.tracking;
    const currentStatus = trackingData?.status || order?.status || 'PENDING';
    const orderDisplayId = trackingData?.order_id || order?.id || orderIdParam;
    const orderItems = order?.items || [];
    const orderTotal = order?.total_amount || 0;
    const orderPaymentMethod = order?.payment_method || 'N/A';
    const orderCreatedAt = order?.created_at || tracking?.history?.[0]?.timestamp || new Date().toISOString();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-primary">Trang chủ</Link> <span className="material-symbols-outlined text-xs">chevron_right</span> <span>Theo dõi đơn hàng</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Trạng thái đơn hàng</h2>
              <p className="text-primary font-medium">Mã đơn hàng: #{orderDisplayId}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/support" className="px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">support_agent</span> Liên hệ hỗ trợ
              </Link>
              {currentStatus !== 'CANCELLED' && currentStatus !== 'COMPLETED' && (
                 <button className="px-6 py-2.5 bg-white border-2 border-primary text-primary font-bold rounded-xl disabled:opacity-50">
                   Hủy đơn hàng
                 </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative flex justify-between items-start">
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0" />
                <div className={`absolute top-5 left-0 h-1 bg-primary -z-0 transition-all duration-500 ${currentStatus === 'COMPLETED' ? 'w-full' : currentStatus === 'SHIPPING' ? 'w-3/4' : currentStatus === 'PROCESSING' ? 'w-1/2' : 'w-1/4'}`} />

                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">check</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Đã đặt hàng</p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['PROCESSING', 'SHIPPING', 'COMPLETED'].includes(currentStatus) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <div>
                    <p className={`text-sm ${['PROCESSING'].includes(currentStatus) ? 'font-bold text-primary step-glow ring-4 ring-primary/20 animate-pulse' : 'font-bold text-slate-400'}`}>Đang chuẩn bị</p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['SHIPPING', 'COMPLETED'].includes(currentStatus) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-outlined">local_shipping</span>
                  </div>
                  <div>
                    <p className={`text-sm ${currentStatus === 'SHIPPING' ? 'font-bold text-primary step-glow ring-4 ring-primary/20 animate-pulse' : 'font-bold text-slate-400'}`}>Đang giao hàng</p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStatus === 'COMPLETED' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-outlined">package_2</span>
                  </div>
                  <div>
                     <p className={`text-sm ${currentStatus === 'COMPLETED' ? 'font-bold text-primary step-glow ring-4 ring-primary/20 animate-pulse' : 'font-bold text-slate-400'}`}>Hoàn thành</p>
                  </div>
                </div>
              </div>
              
              {/* Optional timeline logging based on tracking property */}
              {tracking?.history && tracking.history.length > 0 && (
                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold mb-4">Lịch sử chi tiết {tracking.courier && `(Hãng vận chuyển: ${tracking.courier})`}</h4>
                    <div className="space-y-4">
                        {tracking.history.map((step: any, idx: number) => (
                            <div key={idx} className="flex gap-4">
                                <div className="text-xs text-slate-500 w-24 shrink-0">{new Date(step.timestamp).toLocaleString('vi-VN')}</div>
                                <div className="relative pb-4">
                                    <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-slate-200"></div>
                                    <div className="w-4 h-4 rounded-full border-2 border-primary bg-white relative z-10 mt-1"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{step.note || step.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">Thông tin tóm tắt</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Ngày đặt hàng</span><span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(orderCreatedAt).toLocaleDateString('vi-VN')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Thanh toán</span><span className="font-semibold text-slate-700 dark:text-slate-300">{orderPaymentMethod.toUpperCase()}</span></div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center"><span className="font-bold">Tổng thanh toán</span><span className="text-xl font-extrabold text-primary">{orderTotal.toLocaleString('vi-VN')}₫</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold mb-4">Sản phẩm đã chọn ({orderItems.length})</h3>
              <div className="space-y-4">
                {orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-800 flex-shrink-0 p-1">
                        <img className="w-full h-full object-contain" src={item.product_image || "https://via.placeholder.com/150"} alt={item.product_name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.product_name}</p>
                        <p className="text-xs text-slate-500">SL: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary">{item.price.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                ))}
              </div>
              {orderItems.length === 0 && (
                <p className="text-sm text-slate-500">Không có dữ liệu chi tiết sản phẩm cho đơn hàng này.</p>
              )}
              <Link to={`/account/orders/${orderDisplayId}`} className="block text-center w-full mt-6 py-2 text-sm font-semibold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                Xem chi tiết hóa đơn
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderTracking;