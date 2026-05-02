import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { hasPermission } from '../../admin/utils/permission';

type MenuItem = {
  to: string;
  icon: string;
  label: string;
  permission?: string;
  section?: string;
};

const menuClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-3 transition-colors ${
    isActive
      ? 'bg-red-700/10 text-red-500 border-r-4 border-red-600 font-semibold'
      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
  }`;

const menuItems: MenuItem[] = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Bảng điều khiển' },
  { to: '/admin/events', icon: 'event_note', label: 'Quản lý bài viết', permission: 'events.read' },
  { to: '/admin/products', icon: 'inventory_2', label: 'Quản lý kho', permission: 'products.read' },
  { to: '/admin/categories', icon: 'category', label: 'Danh mục', permission: 'products.read' },
  { to: '/admin/orders', icon: 'receipt_long', label: 'Đơn hàng', permission: 'orders.read' },
  { to: '/admin/customers', icon: 'group', label: 'Khách hàng', permission: 'orders.read' },
  { to: '/admin/coupons', icon: 'local_activity', label: 'Khuyến mãi & Coupon', permission: 'coupons.read' },
  { to: '/admin/flash-deals', icon: 'bolt', label: 'Flash Deal', permission: 'coupons.read' },
  { to: '/admin/settings', icon: 'settings', label: 'Cấu hình hệ thống', permission: 'settings.read' },

  { to: '/admin/suppliers', icon: 'business', label: 'Nhà cung cấp', permission: 'suppliers.read', section: 'Enterprise' },
  { to: '/admin/import-orders', icon: 'shopping_cart', label: 'Đơn nhập hàng', permission: 'imports.read', section: 'Enterprise' },
  { to: '/admin/import-receipts', icon: 'inventory', label: 'Phiếu nhận hàng', permission: 'imports.read', section: 'Enterprise' },
  { to: '/admin/inventory-batches', icon: 'calendar_month', label: 'Batch & Hạn dùng', permission: 'inventory.read', section: 'Enterprise' },
  { to: '/admin/stock-movements', icon: 'swap_vert', label: 'Luân chuyển tồn kho', permission: 'inventory.read', section: 'Enterprise' },
  { to: '/admin/roles', icon: 'admin_panel_settings', label: 'Vai trò & Quyền', permission: 'settings.read', section: 'Enterprise' },
  { to: '/admin/audit-logs', icon: 'history', label: 'Nhật ký hệ thống', permission: 'audit.read', section: 'Enterprise' },

  { to: '/admin/reviews', icon: 'reviews', label: 'Quản lý đánh giá', section: 'CSKH & Trải nghiệm' },
  { to: '/admin/support', icon: 'support_agent', label: 'Hỗ trợ khách hàng', section: 'CSKH & Trải nghiệm' },
];

const AdminSidebar: React.FC = () => {
  const admin = useAppSelector((s) => s.adminAuth.admin);
  const profileName = admin?.name || admin?.full_name || admin?.username || 'Admin';
  const roleLabel = admin?.role_key || admin?.role || 'admin';

  const canShow = (item: MenuItem) => {
    if (!item.permission) return true;
    return hasPermission(admin, item.permission);
  };

  const baseItems = menuItems.filter((m) => !m.section && canShow(m));
  const enterpriseItems = menuItems.filter((m) => m.section === 'Enterprise' && canShow(m));
  const cskhItems = menuItems.filter((m) => m.section === 'CSKH & Trải nghiệm' && canShow(m));

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-800 shadow-2xl flex flex-col py-6 z-50">
      <div className="px-6 mb-10">
        <h1 className="text-xl font-black text-white tracking-tight uppercase">Lotte Mart</h1>
        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">Master Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-1">
        {baseItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={menuClass}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {enterpriseItems.length > 0 && (
          <div className="pt-4 mt-2 border-t border-slate-800">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Enterprise Inventory</p>
            {enterpriseItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={menuClass}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {cskhItems.length > 0 && (
          <div className="pt-4 mt-2 border-t border-slate-800">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">CSKH & Trải nghiệm</p>
            {cskhItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={menuClass}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="px-6 mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <img
            alt="Lotte Mart Admin Profile"
            className="w-8 h-8 rounded-full bg-slate-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJpWum95Ur0iQMH_7VgES1a1oX6xes7RmxGowN3fEuGNS4Iwb11AFFf6XIgYOhUQZoqPjpVBnU8CjKI1LGyxi6RE0De4fhvklFr8ulVp4Xw3eLvKbq7cOCQPowPO3e7fWy28CzokFCFctzDRrF7IqneHcRIZmI3EyALwGVz7dRimYWAySaEiJxDBsaYLDwxrZXtOdAYuoNrzstNGXrwYQjulCDmBvr2VEzhDBTUYMFcneHQgaLVtlIx7WLv3zDy6qNLLO606qtVug"
          />
          <div>
            <p className="text-xs font-bold text-white">{profileName}</p>
            <p className="text-[10px] text-slate-500">{String(roleLabel).replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
