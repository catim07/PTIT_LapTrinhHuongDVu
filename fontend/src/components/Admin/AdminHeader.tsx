import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { useNavigate } from 'react-router-dom';
import AdminBranchFilter from '../../admin/components/AdminBranchFilter';
import { adminLogout, setAdminBranch } from '../../admin/slices/adminAuthSlice';
import { useAppSelector } from '../../store';
import { toast } from '../Toast/toastEvent';

const AdminHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminBranchId } = useAppSelector(state => state.adminAuth);

  const [search, setSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      toast.info(`Đang tìm kiếm: ${search.trim()}`);
    }
  };

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex justify-between items-center px-8 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm flex items-center">
          <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 text-sm leading-none">search</span>
          </div>
          <input
            className="w-full bg-surface-container-low dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:text-white"
            placeholder="Tìm kiếm bài viết, sự kiện, đơn hàng..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
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
          <button onClick={() => toast.info('Chưa có thông báo mới')} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 relative transition-colors">
            <span className="material-symbols-outlined leading-none block">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <button onClick={() => toast.info('Hỗ trợ đang được cập nhật')} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <span className="material-symbols-outlined leading-none block">help_outline</span>
          </button>
          <button onClick={toggleDarkMode} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title={isDarkMode ? 'Tắt chế độ tối' : 'Bật chế độ tối'}>
            <span className="material-symbols-outlined leading-none block">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-sm leading-none block">logout</span>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
