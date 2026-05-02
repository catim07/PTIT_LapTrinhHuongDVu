import React, { useEffect, useState, useMemo, useCallback } from 'react';
import enterpriseService from '../services/enterpriseService';
import { useAppSelector } from '../../store';
import { toast } from '../../components/Toast/toastEvent';
import {
  PageHeader, SearchBar, FilterBar, StatusBadge, EmptyState,
  LoadingOverlay, PaginationControl, DetailDrawer, cls,
} from '../components/AdminUI';

const PAGE_SIZE = 15;

const TYPE_OPTIONS = [
  { value: 'inbound', label: 'Nhập kho (Inbound)' },
  { value: 'outbound', label: 'Xuất kho (Outbound)' },
  { value: 'sale', label: 'Bán hàng (Sale)' },
  { value: 'adjustment', label: 'Điều chỉnh (Adjustment)' },
  { value: 'transfer', label: 'Chuyển kho (Transfer)' },
  { value: 'return', label: 'Trả hàng (Return)' },
  { value: 'cancel', label: 'Hủy hàng (Cancel)' },
];

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  inbound: { icon: 'add_circle', color: 'text-emerald-600' },
  outbound: { icon: 'remove_circle', color: 'text-slate-600' },
  sale: { icon: 'shopping_cart', color: 'text-blue-600' },
  adjustment: { icon: 'tune', color: 'text-violet-600' },
  transfer: { icon: 'local_shipping', color: 'text-indigo-600' },
  return: { icon: 'undo', color: 'text-amber-600' },
  cancel: { icon: 'cancel', color: 'text-red-600' },
};

const AdminStockMovements: React.FC = () => {
  const { adminBranchId } = useAppSelector((s) => s.adminAuth);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  /* Detail drawer */
  const [detailItem, setDetailItem] = useState<any>(null);

  const currentBranchId = adminBranchId === 'ALL' ? '' : adminBranchId;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        branch_id: currentBranchId || undefined,
        type: typeFilter || undefined,
        limit: 500,
      };
      const [listRes, sumRes] = await Promise.all([
        enterpriseService.getStockMovements(params),
        enterpriseService.getStockMovementSummary(params),
      ]);
      setRows(listRes.data || []);
      setSummary(Array.isArray(sumRes) ? sumRes : []);
    } catch (err: any) {
      toast.error(err?.message || 'Không tải được lịch sử luân chuyển kho');
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, typeFilter]);

  useEffect(() => { loadData(); }, [currentBranchId, typeFilter]);

  /* Filtered + paginated */
  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((r) =>
        (r.product_id || '').toLowerCase().includes(q) ||
        (r.branch_product_id || '').toLowerCase().includes(q) ||
        (r.reference_type || '').toLowerCase().includes(q) ||
        (r.movement_type || '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [rows, search]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  /* Stats from summary */
  const summaryCards = useMemo(() => {
    const typeColorMap: Record<string, 'emerald' | 'blue' | 'violet' | 'amber' | 'red' | 'slate'> = {
      inbound: 'emerald', sale: 'blue', adjustment: 'violet', return: 'amber', cancel: 'red',
    };
    return summary.map((item: any) => ({
      label: (item._id || 'unknown').charAt(0).toUpperCase() + (item._id || 'unknown').slice(1),
      value: Number(item.totalQuantity || 0),
      records: item.totalRecords || 0,
      icon: TYPE_ICONS[item._id]?.icon || 'swap_vert',
      color: typeColorMap[item._id] || 'slate',
    }));
  }, [summary]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Luân chuyển tồn kho"
        subtitle="Lịch sử biến động tồn kho theo dõi nhập/xuất/điều chỉnh"
        icon="swap_vert"
        actions={
          <button onClick={loadData} disabled={loading} className={cls.btnSecondary}>
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Làm mới
          </button>
        }
      />

      {/* Summary Cards */}
      {summaryCards.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(summaryCards.length, 5)} gap-4 mb-6`}>
          {summaryCards.map((card, i) => (
            <div key={i} className={`${cls.card} p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => { setTypeFilter(summary[i]?._id || ''); setPage(1); }}
            >
              <div className={`w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined ${TYPE_ICONS[summary[i]?._id]?.color || 'text-slate-600'}`}>{card.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-black text-slate-900">{card.value.toLocaleString('vi-VN')}</p>
                <p className="text-[10px] text-slate-400">{card.records} records</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo sản phẩm, loại, tham chiếu..." />
        <FilterBar filters={[{
          label: 'Tất cả loại', value: typeFilter,
          options: TYPE_OPTIONS,
          onChange: (v) => { setTypeFilter(v); setPage(1); },
        }]} />
      </div>

      {/* Table */}
      <div className={`${cls.card} overflow-hidden relative`}>
        <LoadingOverlay visible={loading} />
        {!loading && filteredRows.length === 0 ? (
          <EmptyState
            icon="swap_vert"
            title="Chưa có lịch sử luân chuyển"
            description="Dữ liệu sẽ tự động ghi nhận khi có biến động tồn kho"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className={cls.thCell}>#</th>
                    <th className={cls.thCell}>Thời gian</th>
                    <th className={cls.thCell}>Loại</th>
                    <th className={cls.thCell}>Chi nhánh</th>
                    <th className={cls.thCell}>Sản phẩm</th>
                    <th className={cls.thCell}>SL thay đổi</th>
                    <th className={cls.thCell}>Tồn trước → sau</th>
                    <th className={cls.thCell}>Tham chiếu</th>
                    <th className={`${cls.thCell} text-right`}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row, idx) => {
                    const isPositive = Number(row.quantity) >= 0;
                    const typeInfo = TYPE_ICONS[row.movement_type] || { icon: 'swap_vert', color: 'text-slate-600' };

                    return (
                      <tr key={String(row._id)} className="hover:bg-slate-50/60 transition-colors group">
                        <td className={`${cls.tdCell} text-slate-400`}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className={cls.tdCell}>
                          <span className="text-xs text-slate-600">
                            {row.created_at ? new Date(row.created_at).toLocaleString('vi-VN') : row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}
                          </span>
                        </td>
                        <td className={cls.tdCell}>
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[16px] ${typeInfo.color}`}>{typeInfo.icon}</span>
                            <StatusBadge status={row.movement_type || 'adjustment'} />
                          </div>
                        </td>
                        <td className={cls.tdCell}>
                          <span className="text-xs">{typeof row.branch_id === 'object' ? row.branch_id?.name : String(row.branch_id || '—')}</span>
                        </td>
                        <td className={cls.tdCell}>
                          <span className="text-xs font-mono truncate max-w-[120px] block">
                            {row.product_name || String(row.product_id || row.branch_product_id || '—').slice(-8)}
                          </span>
                        </td>
                        <td className={cls.tdCell}>
                          <span className={`font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{row.quantity}
                          </span>
                        </td>
                        <td className={cls.tdCell}>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-500">{row.before_stock ?? '—'}</span>
                            <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_forward</span>
                            <span className="font-semibold text-slate-800">{row.after_stock ?? '—'}</span>
                          </div>
                        </td>
                        <td className={cls.tdCell}>
                          <span className="text-xs text-slate-500">
                            {row.reference_type || '—'}
                            {row.reference_id ? ` #${String(row.reference_id).slice(-6)}` : ''}
                          </span>
                        </td>
                        <td className={`${cls.tdCell} text-right`}>
                          <button onClick={() => setDetailItem(row)} className={cls.btnGhost + ' opacity-0 group-hover:opacity-100 transition-opacity'}>
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationControl page={page} pageSize={PAGE_SIZE} total={filteredRows.length} onChange={setPage} />
          </>
        )}
      </div>

      {/* ========== DETAIL DRAWER ========== */}
      <DetailDrawer
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Chi tiết biến động kho"
        subtitle={detailItem?.movement_type ? `Loại: ${detailItem.movement_type}` : ''}
        icon="swap_vert"
      >
        {detailItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={detailItem.movement_type || 'adjustment'} />
              <span className={`font-bold text-lg ${Number(detailItem.quantity) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Number(detailItem.quantity) >= 0 ? '+' : ''}{detailItem.quantity}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chi tiết</h4>
              <div className="space-y-2">
                <InfoRow label="Thời gian" value={detailItem.created_at ? new Date(detailItem.created_at).toLocaleString('vi-VN') : detailItem.createdAt ? new Date(detailItem.createdAt).toLocaleString('vi-VN') : '—'} />
                <InfoRow label="Loại" value={detailItem.type} />
                <InfoRow label="Chi nhánh" value={typeof detailItem.branch_id === 'object' ? detailItem.branch_id?.name : String(detailItem.branch_id || '—')} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Tồn trước</p>
                <p className="font-bold text-slate-800">{detailItem.before_stock ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Tồn mới</p>
                <p className="font-bold text-slate-800">{detailItem.after_stock ?? '—'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Sản phẩm tham chiếu</p>
                <p className="font-mono text-sm text-slate-800 bg-slate-100 px-3 py-2 rounded-lg break-all">
                  {detailItem.product_name || detailItem.product_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Branch Product ID</p>
                <p className="font-mono text-sm text-slate-800 bg-slate-100 px-3 py-2 rounded-lg break-all">
                  {detailItem.branch_product_id}
                </p>
              </div>
              {detailItem.reference_id && (
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Nguồn tham chiếu</p>
                  <p className="font-mono text-sm text-slate-800 bg-slate-100 px-3 py-2 rounded-lg break-all">
                    {detailItem.reference_type} → {String(detailItem.reference_id)}
                  </p>
                </div>
              )}
              {detailItem.note && (
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Lý do / Ghi chú</p>
                  <p className="text-sm text-slate-800">{detailItem.note}</p>
                </div>
              )}
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

export default AdminStockMovements;
