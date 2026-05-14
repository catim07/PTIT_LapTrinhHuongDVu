import React, { useEffect, useMemo, useState, useCallback } from 'react';
import enterpriseService from '../services/enterpriseService';
import { useAppSelector } from '../../store';
import { toast } from '../../components/Toast/toastEvent';
import {
  PageHeader, SearchBar, StatusBadge, EmptyState,
  LoadingOverlay, PaginationControl, Modal, DetailDrawer,
  FormSection, FormField, StatCard, cls, InfoRow
} from '../components/AdminUI';
import { exportImportReceiptPDF, exportImportReceiptWord } from '../utils/exportUtils';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 10;

const AdminImportReceipts: React.FC = () => {
  const { t } = useTranslation();
  const { adminBranchId } = useAppSelector((s) => s.adminAuth);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  /* Create modal */
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [note, setNote] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [lineQty, setLineQty] = useState<Record<string, number>>({});

  /* Detail drawer */
  const [detailReceipt, setDetailReceipt] = useState<any>(null);

  const currentBranchId = adminBranchId === 'ALL' ? '' : adminBranchId;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [receiptRes, orderRes] = await Promise.all([
        enterpriseService.getImportReceipts({ branch_id: currentBranchId || undefined, limit: 500 }),
        enterpriseService.getImportOrders({ branch_id: currentBranchId || undefined, limit: 500 }),
      ]);
      setRows(receiptRes.data || []);
      setOrders(orderRes.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Không tải được phiếu nhận hàng');
    } finally {
      setLoading(false);
    }
  }, [currentBranchId]);

  useEffect(() => { loadData(); }, [currentBranchId]);

  const selectedOrder = useMemo(() => orders.find((o) => String(o._id) === selectedOrderId), [orders, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrder?.items) return;
    const init: Record<string, number> = {};
    selectedOrder.items.forEach((line: any) => {
      const id = String(line._id || line.product_id);
      const remaining = Math.max(0, Number(line.quantity_ordered || 0) - Number(line.quantity_received || 0));
      init[id] = remaining;
    });
    setLineQty(init);
  }, [selectedOrderId]);

  /* Filtered + paginated */
  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((r) =>
        (r.receipt_code || '').toLowerCase().includes(q) ||
        (r.import_order_id?.order_code || '').toLowerCase().includes(q) ||
        (r.supplier_id?.name || '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [rows, search]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const stats = useMemo(() => ({
    total: rows.length,
    totalAmount: rows.reduce((s, r) => s + Number(r.total_amount || 0), 0),
  }), [rows]);

  /* Create receipt */
  const createReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return toast.error('Chọn đơn nhập');

    const items = (selectedOrder.items || [])
      .map((line: any) => {
        const key = String(line._id || line.product_id);
        const qty = Number(lineQty[key] || 0);
        return {
          import_order_item_id: line._id,
          product_id: line.product_id,
          branch_product_id: line.branch_product_id,
          product_name: line.product_name,
          quantity_received: qty,
          unit_cost: Number(line.unit_cost || 0),
          batch_code: line.batch_code || '',
          expiry_date: line.expiry_date || null,
        };
      })
      .filter((line: any) => line.quantity_received > 0);

    if (items.length === 0) return toast.error('Không có dòng nhận hàng hợp lệ');

    try {
      setSubmitting(true);
      await enterpriseService.createImportReceipt({
        import_order_id: selectedOrder._id,
        supplier_id: selectedOrder.supplier_id?._id || selectedOrder.supplier_id,
        branch_id: selectedOrder.branch_id,
        received_date: receivedDate || undefined,
        note,
        items,
      });
      toast.success('Đã tạo phiếu nhận hàng');
      setCreateOpen(false);
      setSelectedOrderId('');
      setLineQty({});
      setNote('');
      setReceivedDate('');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo phiếu nhận hàng');
    } finally {
      setSubmitting(false);
    }
  };

  /* Export Action */
  const handleExportAction = async (type: 'pdf' | 'word', receipt: any) => {
    try {
      setLoading(true);
      if (type === 'pdf') {
        exportImportReceiptPDF(receipt);
      } else {
        await exportImportReceiptWord(receipt);
      }
      toast.success(`Đã xuất ${type.toUpperCase()}`);
    } catch (error) {
      toast.error(`Lỗi khi xuất file ${type.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  /* Receivable order count */
  const receivableOrders = useMemo(() => orders.filter((o) => o.status === 'ordered' || o.status === 'partially_received'), [orders]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Phiếu nhận hàng"
        subtitle="Quản lý và tạo phiếu nhận hàng từ đơn nhập kho"
        icon="fact_check"
        actions={
          <button onClick={() => setCreateOpen(true)} className={cls.btnPrimary}>
            <span className="material-symbols-outlined text-sm">add</span>
            Tạo phiếu nhận
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Tổng phiếu nhận" value={stats.total} icon="receipt" color="blue" />
        <StatCard label="Tổng giá trị" value={`${stats.totalAmount.toLocaleString('vi-VN')} đ`} icon="payments" color="emerald" />
        <StatCard label="Đơn chờ nhận" value={receivableOrders.length} icon="hourglass_top" color="amber" />
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo mã phiếu, mã đơn nhập, NCC..." />
        <button onClick={loadData} className={cls.btnSecondary}>
          <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
        </button>
      </div>

      {/* Table */}
      <div className={`${cls.card} overflow-hidden relative`}>
        <LoadingOverlay visible={loading} />
        {!loading && filteredRows.length === 0 ? (
          <EmptyState
            icon="fact_check"
            title="Chưa có phiếu nhận hàng"
            description="Tạo phiếu nhận hàng từ đơn nhập để bắt đầu"
            action={
              <button onClick={() => setCreateOpen(true)} className={cls.btnPrimary}>
                <span className="material-symbols-outlined text-sm">add</span> Tạo phiếu nhận
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className={cls.thCell}>#</th>
                    <th className={cls.thCell}>Mã phiếu</th>
                    <th className={cls.thCell}>Đơn nhập</th>
                    <th className={cls.thCell}>Nhà cung cấp</th>
                    <th className={cls.thCell}>Chi nhánh</th>
                    <th className={cls.thCell}>Ngày nhận</th>
                    <th className={cls.thCell}>Tổng tiền</th>
                    <th className={cls.thCell}>Trạng thái</th>
                    <th className={`${cls.thCell} text-right`}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row, idx) => (
                    <tr key={String(row._id)} className="hover:bg-slate-50/60 transition-colors group">
                      <td className={`${cls.tdCell} text-slate-400`}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className={cls.tdCell}>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg">{row.receipt_code || '—'}</span>
                      </td>
                      <td className={cls.tdCell}>
                        <span className="font-mono text-xs text-blue-600">{row.import_order_id?.order_code || '—'}</span>
                      </td>
                      <td className={cls.tdCell}>{row.supplier_id?.name || '—'}</td>
                      <td className={cls.tdCell}>{typeof row.branch_id === 'object' ? row.branch_id?.name : String(row.branch_id || '—')}</td>
                      <td className={cls.tdCell}>
                        <span className="text-xs">{row.received_date ? new Date(row.received_date).toLocaleDateString('vi-VN') : '—'}</span>
                      </td>
                      <td className={cls.tdCell}>
                        <span className="font-semibold">{Number(row.total_amount || 0).toLocaleString('vi-VN')} đ</span>
                      </td>
                      <td className={cls.tdCell}>
                        <StatusBadge status={row.status || 'received'} label={row.status === 'received' ? 'Đã nhận' : row.status || 'Hoàn tất'} />
                      </td>
                      <td className={`${cls.tdCell} text-right`}>
                        <button onClick={() => setDetailReceipt(row)} className={cls.btnGhost + ' opacity-0 group-hover:opacity-100 transition-opacity'} title="Xem chi tiết">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControl page={page} pageSize={PAGE_SIZE} total={filteredRows.length} onChange={setPage} />
          </>
        )}
      </div>

      {/* ========== CREATE RECEIPT MODAL ========== */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo phiếu nhận hàng"
        subtitle="Nhận hàng từ đơn nhập kho"
        icon="move_to_inbox"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setCreateOpen(false)} className={cls.btnSecondary}>Hủy</button>
            <button type="submit" form="receipt-form" disabled={submitting} className={cls.btnPrimary}>
              {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              Tạo phiếu nhận
            </button>
          </>
        }
      >
        <form id="receipt-form" onSubmit={createReceipt}>
          <FormSection title="Chọn đơn nhập">
            <FormField label="Đơn nhập hàng" required>
              <select className={cls.select + ' w-full'} value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                <option value="">-- Chọn đơn nhập --</option>
                {receivableOrders.map((o: any) => (
                  <option key={String(o._id)} value={String(o._id)}>
                    {o.order_code} — {o.supplier_id?.name || 'N/A'} — {o.status}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Ngày nhận hàng">
              <input type="date" className={cls.input} value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
            </FormField>
            <FormField label="Ghi chú" colSpan={2}>
              <input className={cls.input} placeholder="Ghi chú..." value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>
          </FormSection>

          {selectedOrder?.items && selectedOrder.items.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sản phẩm nhận ({selectedOrder.items.length})</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((line: any) => {
                  const key = String(line._id || line.product_id);
                  const remaining = Math.max(0, Number(line.quantity_ordered || 0) - Number(line.quantity_received || 0));
                  return (
                    <div key={key} className="bg-slate-50/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{line.product_name || line.product_id}</p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="text-xs text-slate-500">Đặt: <strong>{line.quantity_ordered}</strong></span>
                          <span className="text-xs text-slate-500">Đã nhận: <strong>{line.quantity_received || 0}</strong></span>
                          <span className="text-xs text-emerald-600 font-bold">Còn lại: {remaining}</span>
                          <span className="text-xs text-slate-400">Giá: {Number(line.unit_cost || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-bold w-12">Hạn SD:</label>
                          <input
                            type="date"
                            value={line.expiry_date ? String(line.expiry_date).split('T')[0] : ''}
                            onChange={(e) => {
                              line.expiry_date = e.target.value;
                              setLineQty({...lineQty}); // force re-render hack
                            }}
                            className={cls.input + ' flex-1 !text-xs !py-1'}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-bold w-12">Lô SX:</label>
                          <input
                            type="text" placeholder="Mã lô"
                            value={line.batch_code || ''}
                            onChange={(e) => {
                              line.batch_code = e.target.value;
                              setLineQty({...lineQty}); // force re-render hack
                            }}
                            className={cls.input + ' flex-1 !text-xs !py-1'}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-bold w-12 text-emerald-600">Thực nhận:</label>
                          <input
                            type="number" min={0} max={remaining}
                            value={lineQty[key] ?? 0}
                            onChange={(e) => setLineQty((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                            className={cls.input + ' flex-1 border-emerald-500 !text-emerald-700 !font-bold text-center !py-1'}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* ========== DETAIL DRAWER ========== */}
      <DetailDrawer
        open={!!detailReceipt}
        onClose={() => setDetailReceipt(null)}
        title={`Phiếu nhận ${detailReceipt?.receipt_code || ''}`}
        subtitle={detailReceipt?.supplier_id?.name || ''}
        icon="fact_check"
        width="max-w-2xl"
      >
        {detailReceipt && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={detailReceipt.status || 'received'} label="Đã nhận" />
                <span className="text-xs text-slate-500">
                  {detailReceipt.received_date ? new Date(detailReceipt.received_date).toLocaleDateString('vi-VN') : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportAction('word', detailReceipt)}
                  disabled={loading}
                  className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  {t('importOrders.exportWord', 'Xuất Word')}
                </button>
                <button
                  onClick={() => handleExportAction('pdf', detailReceipt)}
                  disabled={loading}
                  className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  {t('importOrders.exportPdf', 'Xuất PDF')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Mã phiếu" value={detailReceipt.receipt_code} />
              <InfoRow label="Đơn nhập" value={detailReceipt.import_order_id?.order_code} />
              <InfoRow label="Nhà cung cấp" value={detailReceipt.supplier_id?.name} />
              <InfoRow label="Chi nhánh" value={typeof detailReceipt.branch_id === 'object' ? detailReceipt.branch_id?.name : String(detailReceipt.branch_id || '—')} />
              <InfoRow label="Ngày nhận" value={detailReceipt.received_date ? new Date(detailReceipt.received_date).toLocaleDateString('vi-VN') : '—'} />
              <InfoRow label="Tổng tiền" value={`${Number(detailReceipt.total_amount || 0).toLocaleString('vi-VN')} đ`} />
              <InfoRow label="Người nhận" value={detailReceipt.received_by?.full_name || detailReceipt.received_by || '—'} />
              <InfoRow label="Ghi chú" value={detailReceipt.note} />
            </div>

            {detailReceipt.items && detailReceipt.items.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sản phẩm đã nhận ({detailReceipt.items.length})</h4>
                <div className="space-y-2">
                  {detailReceipt.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-50/80 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.product_name || item.product_id}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-slate-500">SL nhận: <strong>{item.quantity_received}</strong></span>
                            <span className="text-xs text-slate-500">Giá: {Number(item.unit_cost || 0).toLocaleString('vi-VN')} đ</span>
                            {item.batch_code && <span className="text-xs text-blue-600">Lô: {item.batch_code}</span>}
                            {item.expiry_date && <span className="text-xs text-orange-600">HSD: {new Date(item.expiry_date).toLocaleDateString('vi-VN')}</span>}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {(Number(item.quantity_received || 0) * Number(item.unit_cost || 0)).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default AdminImportReceipts;
