import React from 'react';
import { useAppDispatch } from '../../store';
import { useNavigate } from 'react-router-dom';
import AdminBranchFilter from '../../admin/components/AdminBranchFilter';
import { adminLogout, setAdminBranch } from '../../admin/slices/adminAuthSlice';
import { useAppSelector } from '../../store';

const AdminHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminBranchId } = useAppSelector(state => state.adminAuth);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder="Tìm kiếm bài viết, sự kiện, đơn hàng..."
            type="text"
          />
        </div>
        <div className="w-1/3">
          <AdminBranchFilter 
            value={adminBranchId || 'ALL'} 
            onChange={(bId) => dispatch(setAdminBranch(bId))} 
            className="w-full rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
