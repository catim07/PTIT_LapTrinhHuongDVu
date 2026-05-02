import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { toast } from '../components/Toast/toastEvent';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Đang chờ', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Đã duyệt', className: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
  picked_up: { label: 'Đã lấy hàng', className: 'bg-indigo-100 text-indigo-700' },
  refunded: { label: 'Đã hoàn tiền', className: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Đã đóng', className: 'bg-slate-200 text-slate-700' },
  cancelled: { label: 'Đã hủy', className: 'bg-slate-200 text-slate-700' },
};

const ReturnRequests: React.FC = () => {
  const location = useLocation();
  const initialOrderId = useMemo(() => new URLSearchParams(location.search).get('orderId') || '', [location.search]);

  const [requests, setRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [reason, setReason] = useState('Hàng bị lỗi/không đúng mô tả');
  const [description, setDescription] = useState('');

  const eligibleOrders = useMemo(() => {
    return orders.filter((order: any) => ['DELIVERED', 'COMPLETED', 'RETURNED'].includes(String(order.status || '').toUpperCase()));
  }, [orders]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestRows, orderRows] = await Promise.all([
        dataService.getReturnRequests(),
        dataService.getOrders(),
      ]);
      setRequests(Array.isArray(requestRows) ? requestRows : []);
      setOrders(Array.isArray(orderRows) ? orderRows : []);
    } catch {
      toast.error('Không thể tải dữ liệu đổi trả/hoàn tiền');
      setRequests([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialOrderId) setSelectedOrderId(initialOrderId);
  }, [initialOrderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      toast.warning('Vui lòng chọn đơn hàng cần yêu cầu đổi trả');
      return;
    }

    setSubmitting(true);
    try {
      await dataService.createReturnRequest({
        order_id: selectedOrderId,
        reason,
        description,
      });
      toast.success('Đã gửi yêu cầu đổi trả/hoàn tiền');
      setDescription('');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi yêu cầu đổi trả');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu đổi trả này?')) return;
    try {
      await dataService.cancelReturnRequest(requestId, 'Khách hàng hủy yêu cầu');
      toast.success('Đã hủy yêu cầu đổi trả');
      await loadData();
    } catch {
      toast.error('Không thể hủy yêu cầu đổi trả');
    }
  };

  if (loading) {
    return <div className="py-12 text-center font-bold">Đang tải yêu cầu đổi trả...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Đổi trả / Hoàn tiền</h2>
        <p className="text-sm text-slate-500 mt-1">Tạo và theo dõi yêu cầu đổi trả cho các đơn đã giao.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
        <h3 className="font-bold">Tạo yêu cầu mới</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Đơn hàng</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3"
            >
              <option value="">Chọn đơn hàng đã giao</option>
              {eligibleOrders.map((order: any) => (
                <option key={String(order.id)} value={String(order.id)}>
                  #{order.id} - {Number(order.total_amount || 0).toLocaleString('vi-VN')}đ - {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Lý do</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3"
            >
              <option>Hàng bị lỗi/không đúng mô tả</option>
              <option>Thiếu sản phẩm trong đơn</option>
              <option>Giao nhầm sản phẩm</option>
              <option>Tôi đổi ý không muốn nhận hàng</option>
              <option>Lý do khác</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Mô tả chi tiết</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3"
            placeholder="Mô tả thêm về tình trạng sản phẩm hoặc yêu cầu hoàn tiền"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Yêu cầu của bạn ({requests.length})</h3>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-10 text-center text-slate-500">
            Chưa có yêu cầu đổi trả nào.
          </div>
        ) : (
          requests.map((request: any) => {
            const statusKey = String(request.status || 'pending').toLowerCase();
            const status = STATUS_LABELS[statusKey] || { label: request.status || 'Không rõ', className: 'bg-slate-100 text-slate-700' };
            return (
              <div key={String(request.id || request._id)} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-bold">Yêu cầu #{String(request.id || request._id).slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">
                      Đơn hàng <Link className="text-primary hover:underline" to={`/account/orders/${request.order_id}`}>#{request.order_id}</Link>
                    </p>
                    <p className="text-sm text-slate-500">Tạo lúc: {request.created_at ? new Date(request.created_at).toLocaleString('vi-VN') : 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>{status.label}</span>
                </div>

                <div className="mt-3 text-sm">
                  <p><span className="font-semibold">Lý do:</span> {request.reason}</p>
                  {request.description && <p className="mt-1 text-slate-600">{request.description}</p>}
                  {Number(request.amount_requested || 0) > 0 && (
                    <p className="mt-1 font-semibold text-primary">Giá trị yêu cầu: {Number(request.amount_requested).toLocaleString('vi-VN')}đ</p>
                  )}
                </div>

                {statusKey === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleCancelRequest(String(request.id || request._id))}
                      className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
                    >
                      Hủy yêu cầu
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReturnRequests;
