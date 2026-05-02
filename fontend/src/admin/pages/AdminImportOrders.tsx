import React, { useEffect, useMemo, useState, useCallback } from 'react';
import enterpriseService from '../services/enterpriseService';
import { dataService } from '../../services/dataService';
import { productService } from '../../services/productService';
import { useAppSelector } from '../../store';
import { toast } from '../../components/Toast/toastEvent';
import {
  PageHeader, SearchBar, FilterBar, StatusBadge, EmptyState,
  LoadingOverlay, PaginationControl, Modal, DetailDrawer,
  FormSection, FormField, StatCard, cls,
} from '../components/AdminUI';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'ordered', label: 'Đã đặt' },
  { value: 'partially_received', label: 'Nhận một phần' },
  { value: 'received', label: 'Đã nhận' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const AdminImportOrders: React.FC = () => {
  const { adminBranchId } = useAppSelector((s) => s.adminAuth);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [branchProducts, setBranchProducts] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  /* Create modal */
  const [createOpen, setCreateOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<any[]>([{ branch_product_id: '', quantity_ordered: 1, unit_cost: 0 }]);

  /* Inline Product Creation */
  const [inlineCreateOpen, setInlineCreateOpen] = useState(false);
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductSupplier, setNewProductSupplier] = useState('');

  /* Detail drawer */
  const [detailOrder, setDetailOrder] = useState<any>(null);

  /* Confirm status change */
  const [statusAction, setStatusAction] = useState<{ id: string; status: string; label: string } | null>(null);

  const currentBranchId = adminBranchId === 'ALL' ? '' : adminBranchId;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, supplierRes, bpRes] = await Promise.all([
        enterpriseService.getImportOrders({ branch_id: currentBranchId || undefined, status: statusFilter || undefined, limit: 500 }),
        enterpriseService.getSuppliers({ is_active: true, limit: 200 }),
        dataService.getBranchProducts(currentBranchId || undefined),
      ]);
      setRows(ordersRes.data || []);
      setSuppliers(supplierRes.data || []);
      setBranchProducts(Array.isArray(bpRes) ? bpRes : []);
    } catch (err: any) {
      toast.error(err?.message || 'Không tải được đơn nhập hàng');
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, statusFilter]);

  useEffect(() => { loadData(); }, [currentBranchId, statusFilter]);

  const branchProductOptions = useMemo(() => {
    return branchProducts.map((bp: any) => ({
      value: String(bp._id || bp.id),
      label: `${bp.product?.name || bp.sku || bp.product_id} | Tồn ${bp.stock || 0}`,
      product_id: bp.product_id,
      name: bp.product?.name || bp.name || '',
    }));
  }, [branchProducts]);

  /* Filtered + paginated */
  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((r) =>
        (r.order_code || '').toLowerCase().includes(q) ||
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
    ordered: rows.filter((r) => r.status === 'ordered').length,
    received: rows.filter((r) => r.status === 'received').length,
    cancelled: rows.filter((r) => r.status === 'cancelled').length,
  }), [rows]);

  /* Line operations */
  const addLine = () => setLines((prev) => [...prev, { branch_product_id: '', quantity_ordered: 1, unit_cost: 0 }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));
  const updateLine = (idx: number, field: string, value: any) => {
    setLines((prev) => prev.map((x, i) => i === idx ? { ...x, [field]: value } : x));
  };

  /* Create order */
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error('Chọn nhà cung cấp');
    if (!currentBranchId) return toast.error('Chọn chi nhánh trong bộ lọc admin');

    const items = lines
      .map((line) => {
        const selected = branchProductOptions.find((o) => o.value === line.branch_product_id);
        return {
          product_id: selected?.product_id,
          product_name: selected?.name,
          branch_product_id: line.branch_product_id,
          quantity_ordered: Number(line.quantity_ordered || 0),
          unit_cost: Number(line.unit_cost || 0),
        };
      })
      .filter((line) => line.product_id && line.branch_product_id && line.quantity_ordered > 0);

    if (items.length === 0) return toast.error('Đơn nhập cần ít nhất 1 dòng sản phẩm hợp lệ');

    try {
      setSubmitting(true);
      await enterpriseService.createImportOrder({
        supplier_id: supplierId,
        branch_id: currentBranchId,
        expected_date: expectedDate || undefined,
        note,
        status: 'ordered',
        items,
      });
      toast.success('Đã tạo đơn nhập');
      setCreateOpen(false);
      resetCreateForm();
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo đơn nhập');
    } finally {
      setSubmitting(false);
    }
  };

  /* Inline Product Creation Handler */
  const handleInlineCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
    if (!currentBranchId) return toast.error('Cần chọn chi nhánh');

    try {
      setInlineSubmitting(true);
      const supplierName = suppliers.find(s => String(s._id) === newProductSupplier)?.name || '';

      await productService.createProduct({
        name: newProductName,
        price: Number(newProductPrice) || 0,
        supplier_id: newProductSupplier || undefined,
        supplier_name: supplierName,
        is_active: true,
      });

      // After product creation, branchProduct is implicitly resolved or explicitly created 
      // during the next branchProducts fetch on the server, but let's force a reload:
      await loadData();
      
      toast.success('Tạo sản phẩm mới thành công. Hãy chọn sản phẩm từ danh sách!');
      setInlineCreateOpen(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductSupplier(supplierId); // prepopulate with order's supplier
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo sản phẩm');
    } finally {
      setInlineSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setSupplierId('');
    setExpectedDate('');
    setNote('');
    setLines([{ branch_product_id: '', quantity_ordered: 1, unit_cost: 0 }]);
  };

  /* Update status */
  const updateStatus = async () => {
    if (!statusAction) return;
    try {
      setLoading(true);
      await enterpriseService.updateImportOrderStatus(statusAction.id, statusAction.status);
      toast.success('Đã cập nhật trạng thái');
      setStatusAction(null);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  /* Total for a line */
  const lineTotal = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.quantity_ordered || 0) * Number(l.unit_cost || 0)), 0);
  }, [lines]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Đơn nhập hàng"
        subtitle="Quản lý đơn đặt hàng nhập kho từ nhà cung cấp"
        icon="inventory"
        actions={
          <button onClick={() => setCreateOpen(true)} className={cls.btnPrimary}>
            <span className="material-symbols-outlined text-sm">add</span>
            Tạo đơn nhập
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng đơn nhập" value={stats.total} icon="receipt_long" color="blue" />
        <StatCard label="Đang xử lý" value={stats.ordered} icon="pending" color="amber" />
        <StatCard label="Đã nhận" value={stats.received} icon="check_circle" color="emerald" />
        <StatCard label="Đã hủy" value={stats.cancelled} icon="cancel" color="red" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo mã đơn, NCC..." />
        <FilterBar filters={[{
          label: 'Tất cả trạng thái', value: statusFilter,
          options: STATUS_OPTIONS,
          onChange: (v) => { setStatusFilter(v); setPage(1); },
        }]} />
        <button onClick={loadData} className={cls.btnSecondary}>
          <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
        </button>
      </div>

      {/* Table */}
      <div className={`${cls.card} overflow-hidden relative`}>
        <LoadingOverlay visible={loading} />
        {!loading && filteredRows.length === 0 ? (
          <EmptyState
            icon="inventory"
            title="Chưa có đơn nhập hàng"
            description="Tạo đơn nhập hàng đầu tiên để bắt đầu"
            action={
              <button onClick={() => setCreateOpen(true)} className={cls.btnPrimary}>
                <span className="material-symbols-outlined text-sm">add</span> Tạo đơn nhập
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
                    <th className={cls.thCell}>Mã đơn</th>
                    <th className={cls.thCell}>Nhà cung cấp</th>
                    <th className={cls.thCell}>Chi nhánh</th>
                    <th className={cls.thCell}>Trạng thái</th>
                    <th className={cls.thCell}>Tổng tiền</th>
                    <th className={cls.thCell}>Ngày tạo</th>
                    <th className={`${cls.thCell} text-right`}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row, idx) => (
                    <tr key={String(row._id)} className="hover:bg-slate-50/60 transition-colors group">
                      <td className={`${cls.tdCell} text-slate-400`}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className={cls.tdCell}>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg">{row.order_code || '—'}</span>
                      </td>
                      <td className={cls.tdCell}>
                        <span className="font-semibold text-slate-800">{row.supplier_id?.name || '—'}</span>
                      </td>
                      <td className={cls.tdCell}>{typeof row.branch_id === 'object' ? row.branch_id?.name : String(row.branch_id || '—')}</td>
                      <td className={cls.tdCell}>
                        <StatusBadge status={row.status || 'draft'} />
                      </td>
                      <td className={cls.tdCell}>
                        <span className="font-semibold">{Number(row.total_amount || 0).toLocaleString('vi-VN')} đ</span>
                      </td>
                      <td className={cls.tdCell}>
                        <span className="text-xs text-slate-500">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : '—'}
                        </span>
                      </td>
                      <td className={`${cls.tdCell} text-right`}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setDetailOrder(row)} className={cls.btnGhost} title="Xem chi tiết">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          {row.status !== 'received' && row.status !== 'cancelled' && (
                            <button
                              onClick={() => setStatusAction({ id: String(row._id), status: 'received', label: 'Đánh dấu đã nhận' })}
                              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              Nhận hàng
                            </button>
                          )}
                          {row.status !== 'cancelled' && row.status !== 'received' && (
                            <button
                              onClick={() => setStatusAction({ id: String(row._id), status: 'cancelled', label: 'Hủy đơn nhập' })}
                              className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
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

      {/* ========== CREATE MODAL ========== */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo đơn nhập hàng mới"
        subtitle="Nhập thông tin đơn đặt hàng từ nhà cung cấp"
        icon="add_shopping_cart"
        size="xl"
        footer={
          <>
            <div className="flex-1 text-sm font-bold text-slate-600">
              Tổng: <span className="text-red-600">{lineTotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <button type="button" onClick={() => setCreateOpen(false)} className={cls.btnSecondary}>Hủy</button>
            <button type="submit" form="import-order-form" disabled={submitting} className={cls.btnPrimary}>
              {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              Tạo đơn nhập
            </button>
          </>
        }
      >
        <form id="import-order-form" onSubmit={save}>
          <FormSection title="Thông tin đơn hàng">
            <FormField label="Nhà cung cấp" required>
              <select className={cls.select + ' w-full'} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((s: any) => <option key={String(s._id)} value={String(s._id)}>{s.name}</option>)}
              </select>
            </FormField>
            <FormField label="Ngày dự kiến nhận">
              <input type="date" className={cls.input} value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </FormField>
            <FormField label="Ghi chú" colSpan={2}>
              <input className={cls.input} placeholder="Ghi chú cho đơn nhập..." value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>
          </FormSection>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách sản phẩm</h4>
              <button type="button" onClick={addLine} className={cls.btnSecondary + ' !py-1.5 !px-3 !text-xs'}>
                <span className="material-symbols-outlined text-sm">add</span> Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2">Số lượng</div>
                <div className="col-span-3">Giá nhập (đ)</div>
                <div className="col-span-1"></div>
              </div>

              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 rounded-xl p-2">
                  <div className="col-span-6">
                    <select
                      value={line.branch_product_id}
                      onChange={(e) => updateLine(idx, 'branch_product_id', e.target.value)}
                      className={cls.select + ' w-full !py-2'}
                    >
                      <option value="">Chọn sản phẩm có sẵn...</option>
                      {branchProductOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button 
                      type="button" 
                      onClick={() => {
                        setNewProductSupplier(supplierId);
                        setInlineCreateOpen(true);
                      }} 
                      className="absolute right-0 top-0 bottom-0 px-2 text-blue-600 hover:text-blue-800 text-xs font-bold"
                    >
                      + Tạo mới
                    </button>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" min={1} value={line.quantity_ordered}
                      onChange={(e) => updateLine(idx, 'quantity_ordered', Number(e.target.value))}
                      className={cls.input + ' !py-2'}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number" min={0} value={line.unit_cost}
                      onChange={(e) => updateLine(idx, 'unit_cost', Number(e.target.value))}
                      className={cls.input + ' !py-2'}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(idx)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* ========== DETAIL DRAWER ========== */}
      <DetailDrawer
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title={`Đơn nhập ${detailOrder?.order_code || ''}`}
        subtitle={detailOrder?.supplier_id?.name || ''}
        icon="inventory"
        width="max-w-2xl"
      >
        {detailOrder && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={detailOrder.status || 'draft'} />
              <span className="text-xs text-slate-500">
                {detailOrder.createdAt ? new Date(detailOrder.createdAt).toLocaleString('vi-VN') : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Mã đơn" value={detailOrder.order_code} />
              <InfoRow label="Nhà cung cấp" value={detailOrder.supplier_id?.name} />
              <InfoRow label="Chi nhánh" value={typeof detailOrder.branch_id === 'object' ? detailOrder.branch_id?.name : String(detailOrder.branch_id || '—')} />
              <InfoRow label="Tổng tiền" value={`${Number(detailOrder.total_amount || 0).toLocaleString('vi-VN')} đ`} />
              <InfoRow label="Ngày dự kiến" value={detailOrder.expected_date ? new Date(detailOrder.expected_date).toLocaleDateString('vi-VN') : '—'} />
              <InfoRow label="Ghi chú" value={detailOrder.note} />
            </div>

            {/* Line items */}
            {detailOrder.items && detailOrder.items.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chi tiết sản phẩm ({detailOrder.items.length})</h4>
                <div className="space-y-2">
                  {detailOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-50/80 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.product_name || item.product_id}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          SL đặt: {item.quantity_ordered} | Đã nhận: {item.quantity_received || 0} | Giá: {Number(item.unit_cost || 0).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {(Number(item.quantity_ordered || 0) * Number(item.unit_cost || 0)).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* ========== INLINE CREATE PRODUCT MODAL ========== */}
      <Modal
        open={inlineCreateOpen}
        onClose={() => setInlineCreateOpen(false)}
        title="Tạo sản phẩm mới nhanh"
        subtitle="Sản phẩm sẽ được thêm vào hệ thống và có thể chọn ngay"
        icon="add_box"
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setInlineCreateOpen(false)} className={cls.btnSecondary}>Hủy</button>
            <button type="submit" form="inline-create-form" disabled={inlineSubmitting} className={cls.btnPrimary}>
              {inlineSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              Tạo nhanh
            </button>
          </>
        }
      >
        <form id="inline-create-form" onSubmit={handleInlineCreateProduct}>
          <FormSection title="Thông tin cơ bản">
            <FormField label="Tên sản phẩm" required>
              <input className={cls.input} value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="Nhập tên sản phẩm..." />
            </FormField>
            <FormField label="Giá bán tham khảo (đ)">
              <input type="number" min={0} className={cls.input} value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
            </FormField>
            <FormField label="Nhà cung cấp">
              <select className={cls.select + ' w-full'} value={newProductSupplier} onChange={e => setNewProductSupplier(e.target.value)}>
                <option value="">-- Không chọn --</option>
                {suppliers.map((s: any) => <option key={String(s._id)} value={String(s._id)}>{s.name}</option>)}
              </select>
            </FormField>
          </FormSection>
        </form>
      </Modal>

      {/* ========== CONFIRM STATUS CHANGE ========== */}
      <Modal
        open={!!statusAction}
        onClose={() => setStatusAction(null)}
        title={statusAction?.label || 'Xác nhận'}
        icon="warning"
        size="sm"
        footer={
          <>
            <button onClick={() => setStatusAction(null)} className={cls.btnSecondary}>Hủy</button>
            <button onClick={updateStatus} disabled={loading} className={statusAction?.status === 'cancelled' ? cls.btnDanger : cls.btnPrimary}>
              {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              Xác nhận
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc chắn muốn <strong>{statusAction?.label?.toLowerCase()}</strong> đơn nhập này?
        </p>
      </Modal>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="py-2 border-b border-slate-50">
    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{label}</span>
    <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
  </div>
);

export default AdminImportOrders;
