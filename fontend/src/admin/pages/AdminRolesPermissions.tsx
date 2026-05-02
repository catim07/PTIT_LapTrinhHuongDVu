import React, { useEffect, useState, useMemo, useCallback } from 'react';
import enterpriseService from '../services/enterpriseService';
import { dataService } from '../../services/dataService';
import { toast } from '../../components/Toast/toastEvent';
import {
  PageHeader, SearchBar, StatusBadge, EmptyState,
  LoadingOverlay, PaginationControl, Modal, DetailDrawer,
  FormSection, FormField, StatCard, cls,
} from '../components/AdminUI';

const PAGE_SIZE = 10;

/* Permission module grouping */
const PERMISSION_MODULES: Record<string, string> = {
  products: '📦 Sản phẩm',
  orders: '🛒 Đơn hàng',
  inventory: '🏭 Tồn kho',
  imports: '📥 Nhập hàng',
  suppliers: '🚚 Nhà cung cấp',
  promotions: '🎁 Khuyến mãi',
  coupons: '🏷️ Coupon',
  events: '📅 Sự kiện',
  settings: '⚙️ Cài đặt',
  audit: '📋 Audit',
  customers: '👥 Khách hàng',
  reviews: '⭐ Đánh giá',
  support: '🎧 Hỗ trợ',
};

const groupPermissions = (perms: any[]) => {
  const groups: Record<string, any[]> = {};
  perms.forEach((p) => {
    const parts = (p.key || '').split('.');
    const module = parts[0] || 'other';
    if (!groups[module]) groups[module] = [];
    groups[module].push(p);
  });
  return groups;
};

const AdminRolesPermissions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  /* Create/Edit role modal */
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState('');
  const [roleForm, setRoleForm] = useState<any>({ key: '', name: '', description: '', permissions: [] as string[] });

  /* Assign role modal */
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRoleKey, setAssignRoleKey] = useState('');

  /* Detail drawer */
  const [detailRole, setDetailRole] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, permRes, usersRes] = await Promise.all([
        enterpriseService.getRoles(),
        enterpriseService.getPermissions(),
        dataService.getUsers(),
      ]);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      setPermissions(Array.isArray(permRes) ? permRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch (err: any) {
      toast.error(err?.message || 'Không tải được RBAC data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  /* Grouped permissions */
  const permissionGroups = useMemo(() => groupPermissions(permissions), [permissions]);

  /* Filtered roles */
  const filteredRoles = useMemo(() => {
    let data = [...roles];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.key || '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [roles, search]);

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRoles.slice(start, start + PAGE_SIZE);
  }, [filteredRoles, page]);

  const stats = useMemo(() => ({
    totalRoles: roles.length,
    systemRoles: roles.filter((r) => r.is_system).length,
    customRoles: roles.filter((r) => !r.is_system).length,
    totalPerms: permissions.length,
  }), [roles, permissions]);

  /* Toggle permission */
  const togglePermission = (key: string) => {
    setRoleForm((prev: any) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((k: string) => k !== key)
        : [...prev.permissions, key],
    }));
  };

  const selectAllPerms = () => {
    setRoleForm((prev: any) => ({ ...prev, permissions: permissions.map((p) => p.key) }));
  };

  const clearAllPerms = () => {
    setRoleForm((prev: any) => ({ ...prev, permissions: [] }));
  };

  const toggleModulePerms = (modulePerms: any[], checked: boolean) => {
    const keys = modulePerms.map((p) => p.key);
    setRoleForm((prev: any) => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...keys])]
        : prev.permissions.filter((k: string) => !keys.includes(k)),
    }));
  };

  /* Open create modal */
  const openCreateRole = () => {
    setEditingRoleId('');
    setRoleForm({ key: '', name: '', description: '', permissions: [] });
    setRoleModalOpen(true);
  };

  /* Open edit modal */
  const openEditRole = (role: any) => {
    setEditingRoleId(String(role._id || role.id));
    setRoleForm({
      key: role.key || '',
      name: role.name || '',
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
    });
    setRoleModalOpen(true);
  };

  /* Save role */
  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.key || !roleForm.name) return toast.error('Nhập key và name cho role');
    try {
      setSubmitting(true);
      if (editingRoleId) {
        await enterpriseService.updateRole(editingRoleId, roleForm);
        toast.success('Đã cập nhật role');
      } else {
        await enterpriseService.createRole(roleForm);
        toast.success('Đã tạo role');
      }
      setRoleModalOpen(false);
      setRoleForm({ key: '', name: '', description: '', permissions: [] });
      setEditingRoleId('');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu role');
    } finally {
      setSubmitting(false);
    }
  };

  /* Assign role */
  const assignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId || !assignRoleKey) return toast.error('Chọn user và role');
    try {
      setSubmitting(true);
      await enterpriseService.assignUserRole({ user_id: assignUserId, role_key: assignRoleKey });
      toast.success('Đã gán vai trò cho user');
      setAssignOpen(false);
      setAssignUserId('');
      setAssignRoleKey('');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gán role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Vai trò & Quyền hạn"
        subtitle="Quản lý phân quyền truy cập hệ thống theo vai trò"
        icon="admin_panel_settings"
        actions={
          <div className="flex gap-3">
            <button onClick={() => setAssignOpen(true)} className={cls.btnSecondary}>
              <span className="material-symbols-outlined text-sm">person_add</span>
              Gán vai trò
            </button>
            <button onClick={openCreateRole} className={cls.btnPrimary}>
              <span className="material-symbols-outlined text-sm">add</span>
              Tạo vai trò mới
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng vai trò" value={stats.totalRoles} icon="badge" color="blue" />
        <StatCard label="Vai trò hệ thống" value={stats.systemRoles} icon="lock" color="violet" />
        <StatCard label="Vai trò tùy chỉnh" value={stats.customRoles} icon="edit" color="emerald" />
        <StatCard label="Tổng quyền" value={stats.totalPerms} icon="key" color="amber" />
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo tên vai trò, key..." />
        <button onClick={loadData} className={cls.btnSecondary}>
          <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
        </button>
      </div>

      {/* Table */}
      <div className={`${cls.card} overflow-hidden relative`}>
        <LoadingOverlay visible={loading} />
        {!loading && filteredRoles.length === 0 ? (
          <EmptyState
            icon="admin_panel_settings"
            title="Chưa có vai trò nào"
            description="Tạo vai trò mới để bắt đầu phân quyền"
            action={
              <button onClick={openCreateRole} className={cls.btnPrimary}>
                <span className="material-symbols-outlined text-sm">add</span> Tạo vai trò
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
                    <th className={cls.thCell}>Tên vai trò</th>
                    <th className={cls.thCell}>Key</th>
                    <th className={cls.thCell}>Mô tả</th>
                    <th className={cls.thCell}>Quyền</th>
                    <th className={cls.thCell}>Hệ thống</th>
                    <th className={`${cls.thCell} text-right`}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRoles.map((r, idx) => {
                    const permCount = Array.isArray(r.permissions) ? r.permissions.length : 0;
                    return (
                      <tr key={String(r._id)} className="hover:bg-slate-50/60 transition-colors group">
                        <td className={`${cls.tdCell} text-slate-400`}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className={cls.tdCell}>
                          <button onClick={() => setDetailRole(r)} className="font-semibold text-slate-900 hover:text-red-600 transition-colors text-left">
                            {r.name}
                          </button>
                        </td>
                        <td className={cls.tdCell}>
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg">{r.key}</span>
                        </td>
                        <td className={cls.tdCell}>
                          <span className="text-xs text-slate-500 line-clamp-1">{r.description || '—'}</span>
                        </td>
                        <td className={cls.tdCell}>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="material-symbols-outlined text-[12px]">key</span>
                            {permCount} quyền
                          </span>
                        </td>
                        <td className={cls.tdCell}>
                          <StatusBadge status={r.is_system ? 'yes' : 'no'} label={r.is_system ? 'Hệ thống' : 'Tùy chỉnh'} />
                        </td>
                        <td className={`${cls.tdCell} text-right`}>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setDetailRole(r)} className={cls.btnGhost} title="Xem">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                            <button onClick={() => openEditRole(r)} className={cls.btnGhost} title="Sửa">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationControl page={page} pageSize={PAGE_SIZE} total={filteredRoles.length} onChange={setPage} />
          </>
        )}
      </div>

      {/* ========== CREATE/EDIT ROLE MODAL ========== */}
      <Modal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={editingRoleId ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
        subtitle={editingRoleId ? `Cập nhật thông tin và quyền` : 'Thiết lập vai trò và phân quyền'}
        icon={editingRoleId ? 'edit' : 'add'}
        size="xl"
        footer={
          <>
            <div className="flex-1 text-xs text-slate-500">
              Đã chọn <strong className="text-red-600">{roleForm.permissions.length}</strong> / {permissions.length} quyền
            </div>
            <button type="button" onClick={() => setRoleModalOpen(false)} className={cls.btnSecondary}>Hủy</button>
            <button type="submit" form="role-form" disabled={submitting} className={cls.btnPrimary}>
              {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              {editingRoleId ? 'Cập nhật' : 'Tạo vai trò'}
            </button>
          </>
        }
      >
        <form id="role-form" onSubmit={saveRole}>
          <FormSection title="Thông tin vai trò">
            <FormField label="Role Key" required>
              <input className={cls.input} placeholder="VD: procurement_staff" value={roleForm.key} onChange={(e) => setRoleForm({ ...roleForm, key: e.target.value })} disabled={!!editingRoleId} />
            </FormField>
            <FormField label="Tên vai trò" required>
              <input className={cls.input} placeholder="VD: Nhân viên thu mua" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} />
            </FormField>
            <FormField label="Mô tả" colSpan={2}>
              <input className={cls.input} placeholder="Mô tả vai trò..." value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
            </FormField>
          </FormSection>

          {/* Permission Matrix */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ma trận quyền hạn</h4>
              <div className="flex gap-2">
                <button type="button" onClick={selectAllPerms} className="px-3 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                  Chọn tất cả
                </button>
                <button type="button" onClick={clearAllPerms} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
              {Object.entries(permissionGroups).map(([module, perms]) => {
                const allChecked = perms.every((p) => roleForm.permissions.includes(p.key));
                const someChecked = perms.some((p) => roleForm.permissions.includes(p.key));
                const moduleLabel = PERMISSION_MODULES[module] || `📁 ${module.charAt(0).toUpperCase() + module.slice(1)}`;

                return (
                  <div key={module} className="border-b border-slate-100 last:border-b-0">
                    {/* Module header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 transition-colors"
                      onClick={() => toggleModulePerms(perms, !allChecked)}
                    >
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                        onChange={() => toggleModulePerms(perms, !allChecked)}
                        className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-700">{moduleLabel}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {perms.filter((p) => roleForm.permissions.includes(p.key)).length}/{perms.length}
                      </span>
                    </div>

                    {/* Individual permissions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 px-4 py-2 pl-10">
                      {perms.map((p) => (
                        <label key={p.key} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={roleForm.permissions.includes(p.key)}
                            onChange={() => togglePermission(p.key)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                          <span className="text-xs text-slate-600">{p.key}</span>
                          {p.description && (
                            <span className="text-[10px] text-slate-400 truncate" title={p.description}>({p.description})</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* ========== ASSIGN ROLE MODAL ========== */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Gán vai trò cho người dùng"
        subtitle="Chọn người dùng và vai trò cần gán"
        icon="person_add"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setAssignOpen(false)} className={cls.btnSecondary}>Hủy</button>
            <button type="submit" form="assign-form" disabled={submitting} className={cls.btnPrimary}>
              {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              Gán vai trò
            </button>
          </>
        }
      >
        <form id="assign-form" onSubmit={assignRole} className="space-y-4">
          <FormField label="Người dùng" required>
            <select className={cls.select + ' w-full'} value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
              <option value="">-- Chọn người dùng --</option>
              {users.map((u: any) => (
                <option key={String(u._id || u.id)} value={String(u._id || u.id)}>
                  {u.full_name || u.username || u.email}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Vai trò" required>
            <select className={cls.select + ' w-full'} value={assignRoleKey} onChange={(e) => setAssignRoleKey(e.target.value)}>
              <option value="">-- Chọn vai trò --</option>
              {roles.map((r: any) => (
                <option key={String(r._id)} value={r.key}>
                  {r.name} ({r.key})
                </option>
              ))}
            </select>
          </FormField>
        </form>
      </Modal>

      {/* ========== DETAIL DRAWER ========== */}
      <DetailDrawer
        open={!!detailRole}
        onClose={() => setDetailRole(null)}
        title={detailRole?.name || 'Chi tiết vai trò'}
        subtitle={`Key: ${detailRole?.key || ''}`}
        icon="admin_panel_settings"
      >
        {detailRole && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={detailRole.is_system ? 'yes' : 'no'} label={detailRole.is_system ? 'Hệ thống' : 'Tùy chỉnh'} />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                <span className="material-symbols-outlined text-[12px]">key</span>
                {Array.isArray(detailRole.permissions) ? detailRole.permissions.length : 0} quyền
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin</h4>
              <div className="space-y-2">
                <InfoRow label="Tên" value={detailRole.name} />
                <InfoRow label="Key" value={detailRole.key} />
                <InfoRow label="Mô tả" value={detailRole.description} />
                <InfoRow label="Hệ thống" value={detailRole.is_system ? 'Có' : 'Không'} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Danh sách quyền</h4>
              {Array.isArray(detailRole.permissions) && detailRole.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {detailRole.permissions.map((perm: string) => (
                    <span key={perm} className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {perm}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Không có quyền nào được gán</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => { openEditRole(detailRole); setDetailRole(null); }} className={cls.btnPrimary + ' flex-1 justify-center'}>
                <span className="material-symbols-outlined text-sm">edit</span> Chỉnh sửa
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

export default AdminRolesPermissions;
