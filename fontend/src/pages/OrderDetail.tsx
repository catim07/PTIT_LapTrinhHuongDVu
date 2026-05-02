import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { loadOrders, cancelOrderThunk } from '../slices/orderSlice';
import { reorderFromOrder } from '../slices/cartSlice';
import { toast } from '../components/Toast/toastEvent';
import { dataService } from '../services/dataService';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: orders, status } = useAppSelector(state => state.order);
  const { user } = useAppSelector(state => state.auth);
  const { branches } = useAppSelector(state => state.branch);
  const currentUserId = user?.id ? Number(user.id) : null;

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => String(b.id) === String(branchId) || String((b as any)?._id) === String(branchId) || b.code === branchId);
    return branch ? branch.name : `Chi nhánh (${branchId})`;
  };
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const order = orders.find(o => String(o.id) === orderId);

  useEffect(() => {
    if (status === 'idle' && currentUserId) {
      dispatch(loadOrders(undefined));
    }
  }, [status, currentUserId, dispatch]);

  if (status === 'loading') return <div className="text-center p-10 font-bold">Đang tải chi tiết đơn hàng...</div>;
  if (!order) return <div className="text-center p-10"><p className="text-slate-500">Không tìm thấy đơn hàng</p></div>;

  const CANCELLABLE_STATUSES = ['PENDING', 'PROCESSING'];
  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
  const isCompletedOrCancelled = ['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(order.status);

  const handleCancelOrder = async () => {
    setIsProcessing(true);
    try {
      const reason = "Khách hàng đổi ý"; // Could be customized via modal input
      await dispatch(cancelOrderThunk({id: String(order.id), reason})).unwrap();
      setShowCancelModal(false);
      toast.success("Hủy đơn hàng thành công!");
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi hủy đơn hàng');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReorder = async () => {
    if (!currentUserId) return;
    setIsProcessing(true);
    try {
      const res = await dispatch(reorderFromOrder({ orderId: String(order.id), userId: currentUserId })).unwrap();
      const addedCount = Number(res?.added_count || 0);
      const unavailableCount = Array.isArray(res?.unavailable_items) ? res.unavailable_items.length : 0;
      const repricedCount = Array.isArray(res?.repriced_items) ? res.repriced_items.length : 0;
      const adjustedCount = Array.isArray(res?.adjusted_items) ? res.adjusted_items.length : 0;

      if (addedCount > 0) {
        toast.success(res.message || `Đã thêm ${addedCount} sản phẩm vào giỏ hàng`);
        navigate('/cart');
      } else {
        toast.warning(res.message || 'Không có sản phẩm khả dụng để mua lại');
      }

      if (unavailableCount > 0 || repricedCount > 0 || adjustedCount > 0) {
        toast.info(
          `Cập nhật khi mua lại: ${unavailableCount} hết hàng, ${repricedCount} đổi giá, ${adjustedCount} điều chỉnh số lượng`,
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi mua lại');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsProcessing(true);
    try {
       const res = await dataService.getInvoice(String(order.id));
       if (res.success && res.url) {
           // Open via the Express server (port 3001 proxied by Vite)
           window.open(`http://localhost:3001${res.url}`, '_blank');
       } else {
           throw new Error(res.message || "Tạo hóa đơn thất bại");
       }
    } catch (err: any) {
       toast.warning("Đang mở bản in...");
       setTimeout(() => { window.print(); }, 500);
    } finally {
       setIsProcessing(false);
    }
  };

  const trackingHistory = order.tracking?.history || [
    { timestamp: order.created_at, status: "PENDING", note: "Đơn hàng đã được tạo" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <Link to="/account/orders" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Trở lại danh sách
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Đơn hàng #{order.id}
              <span className={`text-xs px-3 py-1 rounded-full text-white ${order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'bg-green-500' : order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'}`}>
                 {order.status}
              </span>
            </h1>
            <div className="flex gap-2">
                <button onClick={handleDownloadInvoice} disabled={isProcessing} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">download</span> PDF
                </button>
                {isCancellable && (
                    <button onClick={() => setShowCancelModal(true)} className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-50 transition">
                        <span className="material-symbols-outlined text-sm">cancel</span> Hủy đơn
                    </button>
                )}
                <button onClick={handleReorder} disabled={isProcessing} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">shopping_cart</span> Mua lại
                </button>
            </div>
        </div>
        <p className="text-slate-500 text-sm">
            Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
        </p>
        {/* Branch Info */}
        <div className="flex items-center gap-2 mt-2 bg-primary/5 px-4 py-2 rounded-lg w-fit">
          <span className="material-symbols-outlined text-primary text-lg">storefront</span>
          <span className="text-sm font-bold text-primary">{(order as any).branch_name || getBranchName(order.branch_id)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Items & Timeline) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
             {/* Timeline */}
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                 <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    Tiến trình giao hàng
                 </h3>
                 <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                    {trackingHistory.map((track: any, i: number) => (
                        <div key={i} className="pl-6 relative">
                            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${(i === trackingHistory.length - 1 && track.status !== 'CANCELLED') ? 'bg-primary ring-4 ring-primary/20' : track.status === 'CANCELLED' ? 'bg-red-500' : 'bg-slate-300'}`}></span>
                            <p className="font-bold text-slate-800">{track.note || track.status}</p>
                            <p className="text-sm text-slate-500">{new Date(track.timestamp || track.time).toLocaleString('vi-VN')}</p>
                        </div>
                    ))}
                 </div>
                 <div className="mt-6 border-t border-slate-100 pt-4">
                    <Link to={`/order/track?id=${order.id}`} className="text-primary font-bold text-sm hover:underline">Xem chi tiết hành trình &rarr;</Link>
                 </div>
             </div>

             {/* Items */}
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                 <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                    Sản phẩm ({order.items.length})
                 </h3>
                 <div className="space-y-4">
                     {order.items.map((item, idx) => (
                         <div key={idx} className="flex gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                             <img src={item.product_image || "https://via.placeholder.com/80"} alt={item.product_name} className="w-20 h-20 object-cover rounded-lg border border-slate-100" />
                             <div className="flex-1 min-w-0">
                           <Link to={`/products/${item.product_id || item.branch_product_id}`} className="font-bold text-slate-900 hover:text-primary truncate block">{item.product_name}</Link>
                           <div className="flex flex-col gap-0.5 mt-1.5 mb-2">
                             <p className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-max">
                               SKU: {(item as any).sku || 'N/A'}
                             </p>
                             <p className="text-[11px] text-slate-500 font-medium truncate" title={(item as any).supplier_name || 'N/A'}>
                               <span className="font-bold">Danh mục:</span> {(item as any).category_name || 'N/A'}
                               <span className="mx-2 text-slate-300">|</span> 
                               <span className="font-bold">NCC:</span> {(item as any).supplier_name || 'N/A'}
                             </p>
                             {(item as any)?.expiry_date && (
                               <p className={`text-[11px] font-bold mt-0.5 ${(item as any)?.is_expired ? 'text-red-500' : (item as any)?.is_expiring_soon ? 'text-orange-500' : 'text-slate-500'}`}>
                                 HSD: {new Date((item as any).expiry_date).toLocaleDateString('vi-VN')}
                               </p>
                             )}
                           </div>
                           <p className="text-sm text-slate-500 mt-1">Đơn giá: {(item.final_price || item.price || 0).toLocaleString('vi-VN')}đ | SL: {item.quantity}</p>
                           {(item as any).is_gift && (
                             <span className="inline-flex text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded mt-1">Quà tặng</span>
                           )}
                             </div>
                             <div className="text-right">
                           <p className="font-bold text-primary">{((item.final_price || item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</p>
                           {(item.discount_amount || 0) > 0 && (
                             <p className="text-xs text-green-600 font-semibold">- {(item.discount_amount || 0).toLocaleString('vi-VN')}đ</p>
                           )}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          </div>

          {/* Sidebar Data (Address, Pricing, Payment) */}
          <div className="flex flex-col gap-6">
             {/* Address */}
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">location_on</span>
                        Địa chỉ nhận hàng
                     </h3>
                     {!isCompletedOrCancelled && (
                         <button onClick={() => setShowEditAddressModal(true)} className="text-sm font-bold text-blue-600 hover:underline">Sửa</button>
                     )}
                 </div>
                 {order.order_address ? (
                     <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg space-y-1">
                         <p className="font-bold">{order.order_address.receiver_name}</p>
                         <p>{order.order_address.phone}</p>
                         <p>{order.order_address.full_address || [order.order_address.street, order.order_address.ward, order.order_address.district, order.order_address.city].filter(Boolean).join(', ')}</p>
                         {order.order_address.city && (
                           <p className="text-xs text-slate-500">
                             {[order.order_address.ward, order.order_address.district, order.order_address.city].filter(Boolean).join(', ')}
                           </p>
                         )}
                     </div>
                 ) : (
                     <p className="text-sm text-slate-500">Chưa có thông tin địa chỉ</p>
                 )}
             </div>

             {/* Payment */}
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                 <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">payment</span>
                    Thanh toán
                 </h3>
                 {order.payment ? (
                     <div className="text-sm space-y-2">
                         <div className="flex justify-between"><span className="text-slate-500">Phương thức:</span><span className="font-bold">{order.payment.method}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Mã giao dịch:</span><span className="font-bold">{order.payment.transaction_id || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Trạng thái:</span>
                            <span className={`font-bold ${order.payment.status === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>{order.payment.status}</span>
                         </div>
                     </div>
                 ) : (
                     <p className="text-sm text-slate-500">Thanh toán khi nhận hàng (COD)</p>
                 )}
             </div>

             {/* Price Breakdown */}
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                 <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
                 {Array.isArray((order as any).applied_promotions) && (order as any).applied_promotions.length > 0 && (
                   <div className="mb-4 space-y-2">
                     <p className="text-xs font-bold uppercase text-slate-400 tracking-wide">Khuyến mãi áp dụng</p>
                     {(order as any).applied_promotions.map((promo: any, idx: number) => (
                       <div key={idx} className="flex justify-between text-sm text-green-700">
                         <span>{promo.title}</span>
                         <span>-{Number(promo.discount_amount || 0).toLocaleString('vi-VN')}đ</span>
                       </div>
                     ))}
                   </div>
                 )}
                 {(order as any).applied_coupon?.code && (
                   <div className="mb-4 flex justify-between text-sm text-green-700 font-semibold">
                     <span>Coupon {(order as any).applied_coupon.code}</span>
                     <span>-{Number((order as any).applied_coupon.discount_amount || 0).toLocaleString('vi-VN')}đ</span>
                   </div>
                 )}
                 <div className="space-y-3 text-sm border-b border-slate-100 pb-4 mb-4">
                     <div className="flex justify-between text-slate-600">
                         <span>Tổng tiền hàng:</span>
                         <span className="font-bold text-slate-900">{Number((order as any).pricing_breakdown?.subtotal ?? order.subtotal ?? 0).toLocaleString('vi-VN')}đ</span>
                     </div>
                     <div className="flex justify-between text-slate-600">
                         <span>Phí vận chuyển:</span>
                         <span className="font-bold text-slate-900">{Number((order as any).pricing_breakdown?.shipping_fee ?? order.shipping_fee ?? 0).toLocaleString('vi-VN')}đ</span>
                     </div>
                     <div className="flex justify-between text-slate-600">
                         <span>Giảm giá:</span>
                       <span className="font-bold text-green-600">-{Number(((order as any).pricing_breakdown?.promotion_discount ?? 0) + ((order as any).pricing_breakdown?.coupon_discount ?? 0) || order.discount_amount || 0).toLocaleString('vi-VN')}đ</span>
                     </div>
                     {(order as any).pricing_breakdown?.free_shipping_applied && (
                       <div className="flex justify-between text-slate-600">
                         <span>Freeship:</span>
                         <span className="font-bold text-green-700">Đã áp dụng</span>
                       </div>
                     )}
                     <div className="flex justify-between text-slate-600">
                       <span>Điểm tích lũy:</span>
                       <span className="font-bold text-primary">+{Number((order as any).pricing_breakdown?.points_earned ?? order.points_earned ?? 0)} L.Point</span>
                     </div>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="font-bold text-lg">Tổng cộng:</span>
                     <span className="font-bold text-2xl text-primary">{Number(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
                 </div>
             </div>
          </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
               <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                   <span className="material-symbols-outlined text-2xl">warning</span>
               </div>
               <h3 className="text-xl font-bold text-center mb-2">Xác nhận hủy đơn</h3>
               <p className="text-center text-slate-500 mb-6 text-sm">Bạn có chắc chắn muốn hủy đơn hàng #{order.id}? Hành động này không thể hoàn tác.</p>
               <div className="flex gap-3">
                   <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Đóng</button>
                   <button onClick={handleCancelOrder} disabled={isProcessing} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition disabled:opacity-50">
                       {isProcessing ? 'Đang xử lý...' : 'Xác nhận hủy'}
                   </button>
               </div>
           </div>
        </div>
      )}

      {/* Edit Address Modal Placeholder */}
      {showEditAddressModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Cập nhật địa chỉ giao hàng</h3>
                  <button onClick={() => setShowEditAddressModal(false)} className="material-symbols-outlined text-slate-500 hover:text-slate-900">close</button>
               </div>
               <div className="space-y-4 text-sm">
                   <div>
                       <label className="block text-slate-700 font-bold mb-1">Tên người nhận</label>
                       <input type="text" defaultValue={order.order_address?.receiver_name} className="w-full border border-slate-200 rounded-lg p-2" />
                   </div>
                   <div>
                       <label className="block text-slate-700 font-bold mb-1">Số điện thoại</label>
                       <input type="text" defaultValue={order.order_address?.phone} className="w-full border border-slate-200 rounded-lg p-2" />
                   </div>
                   <div>
                       <label className="block text-slate-700 font-bold mb-1">Địa chỉ</label>
                       <textarea defaultValue={order.order_address?.full_address} className="w-full border border-slate-200 rounded-lg p-2" rows={3}></textarea>
                   </div>
               </div>
               <div className="mt-6 flex gap-3">
                   <button onClick={() => setShowEditAddressModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition">Hủy</button>
                   <button onClick={() => { toast.success('Yêu cầu đổi địa chỉ đã được gửi!'); setShowEditAddressModal(false); }} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition">Lưu cập nhật</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default OrderDetail;
