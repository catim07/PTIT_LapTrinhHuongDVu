import React, { useState, useEffect, useMemo } from "react";
import { dataService } from "../../services/dataService";
import type { Order } from "../../types";
import { toast } from "../../components/Toast/toastEvent";
import { useAppSelector } from '../../store';

const AdminLotteMartOrderManagement: React.FC = () => {
  // State for data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters & sort
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  // Branch filter from Redux
  const { adminBranchId: branchFilter } = useAppSelector(state => state.adminAuth);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("NEWEST");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Order for detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modals state
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [isRefundModalOpen, setRefundModalOpen] = useState(false);
  
  // Update inputs
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [isTrackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingProvider, setShippingProvider] = useState("");

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await dataService.getOrders(branchFilter);
      setOrders(data);
    } catch (err: any) {
      if (!silent) setError(err.message || "Không thể tải danh sách đơn hàng.");
      if (!silent) toast.error("Lỗi khi tải dữ liệu đơn hàng!");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
    
    // Auto polling every 10 seconds to detect new orders from Payment checkout
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [branchFilter]);

  // Filter & Sort Logic
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(lower) || 
        o.order_address?.receiver_name.toLowerCase().includes(lower) ||
        o.order_address?.phone.includes(lower) ||
        o.tracking_number?.toLowerCase().includes(lower)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter(o => o.status === statusFilter);
    }

    // Branch filter — already applied server-side via dataService.getOrders(branchFilter)
    // No additional client-side filtering needed for branch

    // Payment Filter
    if (paymentFilter !== "ALL") {
      result = result.filter(o => 
        o.payment?.method?.toUpperCase() === paymentFilter || 
        o.payment_method?.toUpperCase() === paymentFilter
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "NEWEST":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "OLDEST":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "PRICE_HIGH":
          return b.total_amount - a.total_amount;
        case "PRICE_LOW":
          return a.total_amount - b.total_amount;
        case "ITEMS_HIGH":
          return (b.items?.length || 0) - (a.items?.length || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, searchTerm, statusFilter, branchFilter, paymentFilter, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  
  // Ensure safePage resets if out of bounds
  useEffect(() => {
    if (safePage !== currentPage) setCurrentPage(safePage);
  }, [safePage, currentPage]);

  const displayedOrders = filteredAndSortedOrders.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Stats
  const kpiData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let todayRevenue = 0;
    let pendingCount = 0;
    let shippingCount = 0;

    orders.forEach(o => {
      if (o.status === "PENDING" || o.status === "CONFIRMED") pendingCount++;
      if (o.status === "SHIPPING" || o.status === "PROCESSING") shippingCount++;
      if (o.created_at.startsWith(today) && o.status !== "CANCELLED") {
        todayRevenue += o.total_amount;
      }
    });

    return { total: orders.length, todayRevenue, pendingCount, shippingCount };
  }, [orders]);

  // Handlers
  const openDetail = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeDetail = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await dataService.updateOrderStatus(selectedOrder.id, newStatus, statusNote);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
      toast.success("Cập nhật trạng thái thành công!");
      setStatusModalOpen(false);
      setNewStatus("");
      setStatusNote("");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn.");
      return;
    }
    try {
      const updated = await dataService.cancelOrder(selectedOrder.id, cancelReason);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
      toast.success("Đã hủy đơn hàng!");
      setCancelModalOpen(false);
      setCancelReason("");
    } catch (error: any) {
      toast.error(error.message || "Không thể hủy đơn hàng.");
    }
  };

  const handleRefundOrder = async () => {
    if (!selectedOrder) return;
    if (!refundReason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền.");
      return;
    }
    try {
      const updated = await dataService.refundOrder(selectedOrder.id, refundReason);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
      toast.success("Hoàn tiền thành công!");
      setRefundModalOpen(false);
      setRefundReason("");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi hoàn tiền.");
    }
  };

  const handleAssignTracking = async () => {
    if (!selectedOrder) return;
    if (!trackingNumber.trim()) {
      toast.error("Vui lòng nhập mã vận đơn!");
      return;
    }
    try {
      const updated = await dataService.assignTrackingNumber(selectedOrder.id, trackingNumber, shippingProvider);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
      toast.success("Đã gán mã vận đơn thành công!");
      setTrackingModalOpen(false);
      setTrackingNumber("");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi gán mã vận đơn!");
    }
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Trình duyệt đã chặn popup. Vui lòng bật lại.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn #${selectedOrder.id}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .details { margin-bottom: 20px; font-size: 14px; }
            .details p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .totals { text-align: right; font-size: 14px; }
            .totals p { margin: 5px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>HÓA ĐƠN BÁN LẺ</h2>
            <p>Mã đơn: <strong>#${selectedOrder.id}</strong></p>
            <p>Ngày tạo: ${new Date(selectedOrder.created_at).toLocaleString("vi-VN")}</p>
          </div>
          <div class="details">
            <p><strong>Khách hàng:</strong> ${selectedOrder.order_address?.receiver_name}</p>
            <p><strong>SĐT:</strong> ${selectedOrder.order_address?.phone}</p>
            <p><strong>Địa chỉ:</strong> ${selectedOrder.order_address?.full_address}</p>
            <p><strong>Thanh toán:</strong> ${selectedOrder.payment?.method || selectedOrder.payment_method} - ${selectedOrder.payment?.status}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${(selectedOrder.items || []).map((item: any) => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>${Number(item.price).toLocaleString('vi-VN')} ₫</td>
                  <td>${(item.quantity * Number(item.price)).toLocaleString('vi-VN')} ₫</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Tạm tính: ${(selectedOrder.subtotal || 0).toLocaleString('vi-VN')} ₫</p>
            <p>Phí ship: ${(selectedOrder.shipping_fee || 0).toLocaleString('vi-VN')} ₫</p>
            <p>Giảm giá: - ${(selectedOrder.discount_amount || 0).toLocaleString('vi-VN')} ₫</p>
            <h3>Tổng cộng: ${(selectedOrder.total_amount || 0).toLocaleString('vi-VN')} ₫</h3>
          </div>
          <div class="footer">
            <p>Cảm ơn quý khách đã mua sắm tại Lotte Mart!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };


  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING":
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-full ring-1 ring-amber-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">Chờ xác nhận</span>;
      case "CONFIRMED":
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full ring-1 ring-blue-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">Đã xác nhận</span>;
      case "PROCESSING":
        return <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-full ring-1 ring-indigo-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">Đang chuẩn bị</span>;
      case "SHIPPING":
        return <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase rounded-full ring-1 ring-cyan-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">Đang giao</span>;
      case "DELIVERED":
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full ring-1 ring-emerald-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black uppercase rounded-full ring-1 ring-red-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">Đã hủy</span>;
      case "RETURNED":
        return <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase rounded-full ring-1 ring-purple-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">Đã hoàn tiền/trả hàng</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-700 text-[10px] font-black uppercase rounded-full ring-1 ring-slate-200 whitespace-nowrap inline-flex items-center justify-center min-w-max">{status}</span>;
    }
  };

  return (
    <div className="p-8 space-y-8 w-full mx-auto relative">
      {/* Page Header */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Dashboard</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-primary">Quản lý đơn hàng</span>
              </nav>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Quản lý đơn hàng</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/10 hover:shadow-red-900/25 hover:from-red-700 hover:to-red-800 transition-all cursor-pointer active:scale-[0.98] text-sm" onClick={() => fetchOrders(false)}>
                <span className="material-symbols-outlined text-lg">refresh</span>
                Làm mới
              </button>
            </div>
          </section>

          {/* KPI Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border-none ring-1 ring-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng đơn</p>
                <h3 className="text-2xl font-black text-on-surface">{kpiData.total}</h3>
              </div>
              <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-8xl text-slate-50 opacity-[0.03] group-hover:scale-110 transition-transform">shopping_bag</span>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border-none ring-1 ring-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Doanh thu hôm nay</p>
                <h3 className="text-2xl font-black text-on-surface">{(kpiData.todayRevenue).toLocaleString('vi-VN')} ₫</h3>
              </div>
              <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-8xl text-primary opacity-[0.03] group-hover:scale-110 transition-transform">monetization_on</span>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border-none ring-1 ring-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group border-l-4 border-amber-400">
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chờ xử lý</p>
                <h3 className="text-2xl font-black text-on-surface">{kpiData.pendingCount}</h3>
              </div>
              <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-8xl text-amber-400 opacity-[0.03] group-hover:scale-110 transition-transform">pending_actions</span>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border-none ring-1 ring-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group border-l-4 border-blue-500">
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đang giao hàng</p>
                <h3 className="text-2xl font-black text-on-surface">{kpiData.shippingCount}</h3>
              </div>
              <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-8xl text-blue-500 opacity-[0.03] group-hover:scale-110 transition-transform">package_2</span>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="bg-surface-container-lowest p-4 rounded-xl ring-1 ring-slate-100 space-y-4">
            {/* Branch Filter Row removed because it's in the Header */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px] relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <span className="material-symbols-outlined text-lg">search</span>
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Tìm mã đơn, tên khách, số điện thoại..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-[2]">
                <select 
                  className="bg-surface-container-low border-none rounded-xl text-xs font-semibold py-2.5 px-3 focus:ring-2 focus:ring-primary/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả Trạng thái</option>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PROCESSING">Đang chuẩn bị</option>
                  <option value="SHIPPING">Đang giao hàng</option>
                  <option value="DELIVERED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="RETURNED">Đã hoàn trả/hoàn tiền</option>
                </select>
                <select 
                  className="bg-surface-container-low border-none rounded-xl text-xs font-semibold py-2.5 px-3 focus:ring-2 focus:ring-primary/20"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="ALL">All Thanh toán</option>
                  <option value="COD">Tiền mặt (COD)</option>
                  <option value="CARD">Thẻ Tín Dụng</option>
                  <option value="VNPAY">Hoặc Ví điện tử</option>
                </select>
                <select 
                  className="bg-surface-container-low border-none rounded-xl text-xs font-semibold py-2.5 px-3 focus:ring-2 focus:ring-primary/20"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="NEWEST">Mới nhất</option>
                  <option value="OLDEST">Cũ nhất</option>
                  <option value="PRICE_HIGH">Tổng tiền Cao {'->'} Thấp</option>
                  <option value="PRICE_LOW">Tổng tiền Thấp {'->'} Cao</option>
                </select>
                <button className="flex items-center justify-center gap-2 bg-surface-container-low border-none rounded-xl text-xs font-semibold py-2.5 hover:bg-surface-container-high transition-colors text-slate-400" onClick={() => {
                  setSearchTerm(''); setStatusFilter("ALL"); setPaymentFilter("ALL"); setSortOption("NEWEST");
                }}>
                  <span className="material-symbols-outlined text-sm">filter_list_off</span>
                  Xóa lọc
                </button>
              </div>
            </div>
          </section>

          {/* Data Table */}
          <section className="bg-surface-container-lowest rounded-xl ring-1 ring-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center"><span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span></div>
            ) : error ? (
              <div className="p-12 text-center text-error font-bold">{error}</div>
            ) : displayedOrders.length === 0 ? (
               <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                 <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">sentiment_dissatisfied</span>
                 <p>Không có đơn hàng nào khớp với điều kiện lọc</p>
               </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-none">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Mã đơn</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Khách hàng</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Ngày đặt</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Số lượng</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Tổng tiền</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-container/50 transition-colors group cursor-pointer" onClick={() => openDetail(order)}>
                      <td className="px-6 py-4 text-sm font-bold text-primary">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                            {order.order_address?.receiver_name.substring(0,2).toUpperCase() || "KH"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-on-surface">{order.order_address?.receiver_name || "N/A"}</p>
                            <p className="text-[10px] text-slate-400">{order.order_address?.phone || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                      <td className="px-6 py-4 text-xs font-medium text-center">{order.items?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-black text-right">{(order.total_amount || 0).toLocaleString('vi-VN')} ₫</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(order.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer active:scale-[0.95]" onClick={() => openDetail(order)}><span className="material-symbols-outlined text-lg">visibility</span></button>
                          <button className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer active:scale-[0.95]" title="In / Tải hóa đơn" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setTimeout(() => handlePrintInvoice(), 100); }}><span className="material-symbols-outlined text-lg">print</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {/* Pagination */}
            {!loading && displayedOrders.length > 0 && (
              <div className="p-4 bg-surface-container-low flex items-center justify-between border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Hiển thị {(safePage - 1) * itemsPerPage + 1} - {Math.min(safePage * itemsPerPage, filteredAndSortedOrders.length)} trong {filteredAndSortedOrders.length} đơn hàng
                </p>
                <div className="flex items-center gap-1">
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white transition-all text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.95]" disabled={safePage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <span className="text-xs font-bold px-2">{safePage} / {totalPages}</span>
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white transition-all text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.95]" disabled={safePage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </section>

      <aside className={`fixed top-0 right-0 w-full sm:w-[420px] lg:w-[480px] h-screen bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-[60] transform transition-transform duration-500 ease-in-out border-l border-slate-100 flex flex-col ${selectedOrder ? "translate-x-0" : "translate-x-full"}`}>
        {selectedOrder && (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-surface-container-low/50">
              <div>
                <h4 className="text-lg font-black tracking-tight">Chi tiết đơn hàng</h4>
                <p className="text-xs font-bold text-primary">#{selectedOrder.id}</p>
              </div>
              <button onClick={closeDetail} className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all cursor-pointer active:scale-[0.95]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {/* STATUS INDICATOR */}
              <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-slate-100">
                <span className="text-sm font-bold text-slate-500">Trạng thái: </span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Status Timeline */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline</p>
                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {selectedOrder.timeline.map((point, idx) => (
                      <div className="relative" key={idx}>
                        <span className="absolute -left-[19px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-white"></span>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-on-surface">{point.status}</p>
                            <p className="text-[10px] text-slate-400">{point.note || "Cập nhật hệ thống"}</p>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">{new Date(point.timestamp).toLocaleString("vi-VN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="p-4 bg-surface-container rounded-xl space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thông tin khách hàng</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">Tên:</span>
                    <span className="text-xs font-bold">{selectedOrder.order_address?.receiver_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">SĐT:</span>
                    <span className="text-xs font-bold">{selectedOrder.order_address?.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">Địa chỉ:</span>
                    <span className="text-xs font-bold text-right max-w-[200px] leading-tight">{selectedOrder.order_address?.full_address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">Thanh toán:</span>
                    <span className="text-xs font-bold uppercase">{selectedOrder.payment?.method || selectedOrder.payment_method} - {selectedOrder.payment?.status || selectedOrder.payment_status}</span>
                  </div>
                  {selectedOrder.tracking_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400">Vận chuyển:</span>
                      <span className="text-xs font-bold text-blue-600">{selectedOrder.shipping_provider || 'Hệ thống'} - {selectedOrder.tracking_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh sách sản phẩm ({selectedOrder.items?.length})</p>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                     const isGift = item.is_gift || false;
                     const finalPrice = item.final_price ?? item.price ?? 0;
                     const originalPrice = item.original_price ?? finalPrice;
                     const discountAmt = item.discount_amount ?? item.discount ?? 0;
                     return (
                    <div className="flex items-center gap-4" key={idx}>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-50 relative">
                        {isGift && <div className="absolute top-0 right-0 bg-primary/90 w-full text-white text-[8px] text-center font-bold">QUÀ TẶNG</div>}
                        <img
                          alt="product"
                          className="w-full h-full object-cover"
                          src={item.product_image || "https://via.placeholder.com/150"}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold line-clamp-2 leading-tight">
                          {isGift && <span className="text-primary mr-1">[Quà tặng]</span>}
                          {item.product_name}
                        </p>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                          <span>SL: {item.quantity}</span>
                          {!isGift && (
                             <>
                               {discountAmt > 0 && <span className="line-through ml-1">{Number(originalPrice).toLocaleString('vi-VN')}đ</span>}
                               <span className={discountAmt > 0 ? "text-primary font-bold" : ""}> x {Number(finalPrice).toLocaleString('vi-VN')}đ</span>
                             </>
                          )}
                          {isGift && <span className="text-primary font-bold"> (Miễn phí)</span>}
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black">{(item.quantity * finalPrice).toLocaleString('vi-VN')} ₫</p>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-slate-100 pt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Tạm tính</span>
                  <span className="text-xs font-bold">{(selectedOrder.subtotal || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Phí giao hàng</span>
                  <span className="text-xs font-bold text-emerald-600">{selectedOrder.shipping_fee > 0 ? `${selectedOrder.shipping_fee.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Giảm giá</span>
                  <span className="text-xs font-bold text-red-500">- {(selectedOrder.discount_amount || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between pt-4">
                  <span className="text-sm font-black">Tổng thanh toán</span>
                  <span className="text-lg font-black text-primary tracking-tight">{(selectedOrder.total_amount || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              {selectedOrder.customer_note && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-blue-600 text-sm">chat</span>
                    <span className="text-[10px] font-black uppercase text-blue-700">Khách ghi chú</span>
                  </div>
                  <p className="text-[10px] text-blue-800 leading-relaxed italic">"{selectedOrder.customer_note}"</p>
                </div>
              )}

              {selectedOrder.cancel_reason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                    <span className="text-[10px] font-black uppercase text-red-700">Lý do hủy đơn</span>
                  </div>
                  <p className="text-[10px] text-red-800 leading-relaxed font-bold">"{selectedOrder.cancel_reason}"</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-surface-container-low/30 flex flex-wrap gap-3 shrink-0">
              <button 
                onClick={handlePrintInvoice}
                className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98] flex-1 min-w-[120px]"
              >
                In Hóa đơn
              </button>

              {(!selectedOrder.tracking_number && selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'REFUNDED') && (
                <button 
                  onClick={() => setTrackingModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98] flex-1 min-w-[120px]"
                >
                  Gán Shipping
                </button>
              )}

              {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PROCESSING') && (
                <button 
                  onClick={() => setCancelModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98] flex-1 min-w-[120px]"
                >
                  Hủy đơn
                </button>
              )}

              {selectedOrder.status === 'CANCELLED' && selectedOrder.refund_status !== 'COMPLETED' && (
                <button 
                  onClick={() => setRefundModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-white border border-slate-200 text-purple-600 hover:bg-purple-50 hover:border-purple-200 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98] flex-1 min-w-[120px]"
                >
                  Hoàn tiền
                </button>
              )}
              
              <button 
                onClick={() => setStatusModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/10 hover:shadow-red-900/25 hover:from-red-700 hover:to-red-800 transition-all cursor-pointer active:scale-[0.98] flex-1 min-w-[120px]"
              >
                Trạng thái
              </button>
            </div>
          </>
        )}
      </aside>

      {/* OVERLAYS & MODALS */}
      {/* Update Status Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setStatusModalOpen(false)}></div>
          <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-8 space-y-6 z-10 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">update</span>
              </div>
              <h3 className="text-xl font-black">Cập nhật trạng thái</h3>
              <p className="text-xs text-slate-400 mt-2">Đơn hàng #{selectedOrder.id}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái mới</label>
                <select 
                  className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="" disabled>-- Chọn trạng thái --</option>
                  <option value="CONFIRMED">Xác nhận đơn</option>
                  <option value="PROCESSING">Đang chuẩn bị hàng</option>
                  <option value="SHIPPING">Đang giao hàng</option>
                  <option value="DELIVERED">Trọn vẹn / Hoàn thành</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ghi chú (Tùy chọn)</label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 h-24 focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Ghi chú nội bộ..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStatusModalOpen(false)} className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]">Đóng</button>
              <button 
                onClick={handleUpdateStatus} 
                disabled={!newStatus}
                className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/10 hover:shadow-red-900/25 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)}></div>
          <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-8 space-y-6 z-10 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 text-3xl">cancel</span>
              </div>
              <h3 className="text-xl font-black text-red-600">Hủy đơn hàng</h3>
              <p className="text-xs text-slate-400 mt-2">Hành động này không thể hoàn tác. Khách hàng sẽ nhận được thông báo về việc hủy đơn.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lý do hủy (Bắt buộc)*</label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 h-24 focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Nhập lý do chi tiết..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModalOpen(false)} className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]">Đóng</button>
              <button 
                onClick={handleCancelOrder} 
                disabled={!cancelReason.trim()}
                className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-bold shadow-lg shadow-red-600/15 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRefundModalOpen(false)}></div>
          <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-8 space-y-6 z-10 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-purple-600 text-3xl">currency_exchange</span>
              </div>
              <h3 className="text-xl font-black text-purple-600">Xử lý Hoàn tiền</h3>
              <p className="text-xs text-slate-400 mt-2">Số tiền hoàn: <strong>{(selectedOrder.total_amount || 0).toLocaleString('vi-VN')} ₫</strong></p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lý do hoàn tiền / Ghi chú</label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 h-24 focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Hoàn tiền do hủy đơn..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRefundModalOpen(false)} className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]">Tra sau</button>
              <button 
                onClick={handleRefundOrder} 
                className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-sm font-bold shadow-lg shadow-purple-600/15 transition-all cursor-pointer active:scale-[0.98]"
              >
                Hoàn ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {isTrackingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setTrackingModalOpen(false)}></div>
          <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-8 space-y-6 z-10 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-blue-600 text-3xl">local_shipping</span>
              </div>
              <h3 className="text-xl font-black text-blue-600">Gán mã vận đơn</h3>
              <p className="text-xs text-slate-400 mt-2">Đơn hàng #{selectedOrder.id}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Đơn vị vận chuyển (Tùy chọn)</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  placeholder="VD: GHTK, Viettel Post, AhaMove..."
                  value={shippingProvider}
                  onChange={(e) => setShippingProvider(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mã vận đơn (Bắt buộc)*</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low border-none rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  placeholder="Nhập mã tracking..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setTrackingModalOpen(false)} className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]">Đóng</button>
              <button 
                onClick={handleAssignTracking} 
                disabled={!trackingNumber.trim()}
                className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/15 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLotteMartOrderManagement;