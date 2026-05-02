import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';

const Account: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  if (!user) return null;

  const quickLinks = [
    { to: '/account/orders', icon: 'shopping_bag', label: 'Đơn hàng', desc: 'Xem lịch sử mua hàng' },
    { to: '/account/addresses', icon: 'location_on', label: 'Địa chỉ', desc: 'Quản lý địa chỉ giao hàng' },
    { to: '/account/payments', icon: 'credit_card', label: 'Thanh toán', desc: 'Phương thức thanh toán' },
    { to: '/account/coupons', icon: 'sell', label: 'Voucher', desc: 'Mã giảm giá của tôi' },
    { to: '/account/loyalty', icon: 'military_tech', label: 'Điểm thưởng', desc: `${(user.lotte_points || 0).toLocaleString('vi-VN')} điểm hiện có` },
    { to: '/account/reviews', icon: 'star', label: 'Đánh giá', desc: 'Đánh giá sản phẩm' },
    { to: '/account/notifications', icon: 'notifications', label: 'Thông báo', desc: 'Thông báo và cập nhật' },
    { to: '/account/support', icon: 'chat_bubble', label: 'Hỗ trợ', desc: 'Hỗ trợ khách hàng' },
    { to: '/account/settings', icon: 'settings', label: 'Cài đặt', desc: 'Cài đặt tài khoản' },
  ];

  return (
    <div className="space-y-8">
      {/* User summary card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user.avatar || 'https://i.pravatar.cc/100?img=12'}
          alt={user.full_name || user.username}
          className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shrink-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user.full_name || user.username}
          </h2>
          <p className="text-slate-500 mt-1">{user.email}</p>
          <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-[14px] fill-1">stars</span>
              {user.membership_level}
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">military_tech</span>
              {(user.lotte_points || 0).toLocaleString('vi-VN')} điểm
            </span>
          </div>
          <div className="mt-4 flex gap-3 justify-center sm:justify-start">
            <Link to="/account/profile" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
              Chỉnh sửa hồ sơ
            </Link>
            <Link to="/account/settings" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cài đặt
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Quản lý tài khoản</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {quickLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">{link.icon}</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{link.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Account;
