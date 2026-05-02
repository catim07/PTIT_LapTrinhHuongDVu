import React, { useEffect, useState, useMemo, useCallback } from 'react';
import enterpriseService from '../services/enterpriseService';
import { toast } from '../../components/Toast/toastEvent';
import {
  PageHeader, SearchBar, FilterBar, StatusBadge, EmptyState,
  PaginationControl, Modal, DetailDrawer,
  FormSection, FormField, StatCard, cls, LoadingOverlay,
} from '../components/AdminUI';

const emptyForm = {
  name: '', code: '', contact_name: '', phone: '', email: '',
  address: '', tax_code: '', payment_terms: '', note: '', is_active: true,
};

const PAGE_SIZE = 10;

const AdminSuppliers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  /* Modal states */
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState('');

  /* Detail drawer */
  const [detailDrawer, setDetailDrawer] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await enterpriseService.getSuppliers({ search: search || undefined, limit: 500 });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err?.message || 'Không tải được danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadData(); }, []);

  /* Filtered + paginated data */
  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (statusFilter === 'active') data = data.filter((r) => r.is_active !== false);
    if (statusFilter === 'inactive') data = data.filter((r) => r.is_active === false);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.code || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [rows, statusFilter, search]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((r) => r.is_active !== false).length,
    inactive: rows.filter((r) => r.is_active === false).length,
  }), [rows]);

  /* Open create/edit modal */
  const openCreate = () => {
    setEditingId('');
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(String(row._id || row.id));
    setForm({
      name: row.name || '', code: row.code || '',
      contact_name: row.contact_name || '', phone: row.phone || '',
      email: row.email || '', address: row.address || '',
      tax_code: row.tax_code || '', payment_terms: row.payment_terms || '',
      note: row.note || '', is_active: row.is_active !== false,
    });
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error('Tên nhà cung cấp là bắt buộc');

    try {
      setSubmitting(true);
      if (editingId) {
        await enterpriseService.updateSupplier(editingId, form);
        toast.success('Đã cập nhật nhà cung cấp');
      } else {
        await enterpriseService.createSupplier(form);
        toast.success('Đã tạo nhà cung cấp');
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId('');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu nhà cung cấp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (row: any) => {
    try {
      setLoading(true);
      await enterpriseService.updateSupplier(String(row._id || row.id), { is_active: !row.is_active });
      toast.success(row.is_active ? 'Đã ngưng hoạt động nhà cung cấp' : 'Đã kích hoạt nhà cung cấp');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Nhà cung cấp"
        subtitle="Quản lý danh sách nhà cung cấp, thông tin liên hệ và điều khoản"
        icon="local_shipping"
        actions={
          <button onClick={openCreate} className={cls.btnPrimary}>
            <span className="material-symbols-outlined text-sm">add</span>
            Thêm nhà cung cấp
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Tổng nhà cung cấp" value={stats.total} icon="groups" color="blue" />
        <StatCard label="Đang hoạt động" value={stats.active} icon="check_circle" color="emerald" />
        <StatCard label="Ngưng hoạt động" value={stats.inactive} icon="pause_circle" color="red" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} onSearch={loadData} placeholder="Tìm theo tên, mã, email..." />
        <FilterBar filters={[{
          label: 'Tất cả trạng thái', value: statusFilter,
          options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngưng hoạt động' }],
          onChange: (v) => { setStatusFilter(v); setPage(1); },
        }]} />
        <button onClick={loadData} className={cls.btnSecondary}>
          <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
        </button>
      </div>

      {/* Data Table */}
      <div className={`${cls.card} overflow-hidden relative`}>
        <LoadingOverlay visible={loading} />
        {!loading && filteredRows.length === 0 ? (
          <EmptyState
            icon="local_shipping"
            title="Chưa có nhà cung cấp nào"
            description="Bắt đầu bằng cách thêm nhà cung cấp đầu tiên"
            action={
              <button onClick={openCreate} className={cls.btnPrimary}>
                <span className="material-symbols-outlined text-sm">add</span> Thêm nhà cung cấp
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
                    <th className={cls.thCell}>Mã NCC</th>
                    <th className={cls.thCell}>Tên nhà cung cấp</th>
                    <th className={cls.thCell}>Liên hệ</th>
                    <th className={cls.thCell}>Email / SĐT</th>
                    <th className={cls.thCell}>Trạng thái</th>
                    <th className={`${cls.thCell} text-right`}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row, idx) => (
                    <tr key={String(row._id)} className="hover:bg-slate-50/60 transition-colors group">
                      <td className={`${cls.tdCell} text-slate-400`}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className={cls.tdCell}>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg">{row.code || '—'}</span>
                      </td>
                      <td className={cls.tdCell}>
                        <button onClick={() => setDetailDrawer(row)} className="font-semibold text-slate-900 hover:text-red-600 transition-colors text-left">
                          {row.name}
                        </button>
                      </td>
                      <td className={cls.tdCell}>{row.contact_name || '—'}</td>
                      <td className={cls.tdCell}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-slate-600">{row.email || '—'}</span>
                          <span className="text-xs text-slate-400">{row.phone || ''}</span>
                        </div>
                      </td>
                      <td className={cls.tdCell}>
                        <StatusBadge status={row.is_active !== false ? 'active' : 'inactive'} label={row.is_active !== false ? 'Hoạt động' : 'Ngưng'} />
                      </td>
                      <td className={`${cls.tdCell} text-right`}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setDetailDrawer(row)} className={cls.btnGhost} title="Xem chi tiết">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button onClick={() => openEdit(row)} className={cls.btnGhost} title="Sửa">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleToggleActive(row)} className={cls.btnGhost} title={row.is_active ? 'Ngưng hoạt động' : 'Kích hoạt'}>
                            <span className="material-symbols-outlined text-[16px]">{row.is_active ? 'pause_circle' : 'play_circle'}</span>
                          </button>
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

      {/* ========== CREATE / EDIT MODAL ========== */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        subtitle={editingId ? 'Chỉnh sửa thông tin nhà cung cấp' : 'Nhập thông tin nhà cung cấp mới'}
        icon={editingId ? 'edit' : 'add_business'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className={cls.btnSecondary}>Hủy</button>
            <button type="submit" form="supplier-form" disabled={submitting} className={cls.btnPrimary}>
              {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              {editingId ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </>
        }
      >
        <form id="supplier-form" onSubmit={submit}>
          <FormSection title="Thông tin cơ bản">
            <FormField label="Tên nhà cung cấp" required>
              <input className={cls.input} placeholder="VD: Công ty TNHH ABC" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Mã NCC">
              <input className={cls.input} placeholder="VD: SUP001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </FormField>
            <FormField label="Mã số thuế">
              <input className={cls.input} placeholder="VD: 0123456789" value={form.tax_code} onChange={(e) => setForm({ ...form, tax_code: e.target.value })} />
            </FormField>
            <FormField label="Trạng thái">
              <select className={cls.select + ' w-full'} value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}>
                <option value="1">Hoạt động</option>
                <option value="0">Ngưng giao dịch</option>
              </select>
            </FormField>
          </FormSection>

          <FormSection title="Liên hệ">
            <FormField label="Người liên hệ">
              <input className={cls.input} placeholder="Tên người liên hệ" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </FormField>
            <FormField label="Số điện thoại">
              <input className={cls.input} placeholder="0901 234 567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <FormField label="Email">
              <input className={cls.input} type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label="Địa chỉ" colSpan={2}>
              <input className={cls.input} placeholder="Địa chỉ nhà cung cấp" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </FormField>
          </FormSection>

          <FormSection title="Thanh toán & Ghi chú">
            <FormField label="Điều khoản thanh toán">
              <input className={cls.input} placeholder="VD: NET 30, COD" value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} />
            </FormField>
            <FormField label="Ghi chú" colSpan={2}>
              <textarea className={cls.input + ' resize-none'} rows={3} placeholder="Ghi chú thêm..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </FormField>
          </FormSection>
        </form>
      </Modal>

      {/* ========== DETAIL DRAWER ========== */}
      <DetailDrawer
        open={!!detailDrawer}
        onClose={() => setDetailDrawer(null)}
        title={detailDrawer?.name || 'Chi tiết nhà cung cấp'}
        subtitle={detailDrawer?.code || ''}
        icon="local_shipping"
      >
        {detailDrawer && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={detailDrawer.is_active !== false ? 'active' : 'inactive'} label={detailDrawer.is_active !== false ? 'Hoạt động' : 'Ngưng hoạt động'} />
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin cơ bản</h4>
              <div className="space-y-3">
                <InfoRow label="Tên" value={detailDrawer.name} />
                <InfoRow label="Mã NCC" value={detailDrawer.code} />
                <InfoRow label="Mã số thuế" value={detailDrawer.tax_code} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Liên hệ</h4>
              <div className="space-y-3">
                <InfoRow label="Người liên hệ" value={detailDrawer.contact_name} />
                <InfoRow label="Email" value={detailDrawer.email} />
                <InfoRow label="Số điện thoại" value={detailDrawer.phone} />
                <InfoRow label="Địa chỉ" value={detailDrawer.address} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thanh toán</h4>
              <div className="space-y-3">
                <InfoRow label="Điều khoản" value={detailDrawer.payment_terms} />
                <InfoRow label="Ghi chú" value={detailDrawer.note} />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => { openEdit(detailDrawer); setDetailDrawer(null); }} className={cls.btnPrimary + ' flex-1 justify-center'}>
                <span className="material-symbols-outlined text-sm">edit</span> Chỉnh sửa
              </button>
              <button onClick={() => { handleToggleActive(detailDrawer); setDetailDrawer(null); }} className={cls.btnSecondary + ' flex-1 justify-center'}>
                <span className="material-symbols-outlined text-sm">{detailDrawer.is_active ? 'pause_circle' : 'play_circle'}</span>
                {detailDrawer.is_active ? 'Ngưng' : 'Kích hoạt'}
              </button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-slate-50">
    <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-slate-800 text-right">{value || '—'}</span>
  </div>
);

export default AdminSuppliers;
