import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loadLoyaltyTransactions } from '../slices/loyaltySlice';

const LoyaltyRewards: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector(state => state.auth);
  const { transactions, status, error } = useAppSelector(state => state.loyalty);
  
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(loadLoyaltyTransactions());
    }
  }, [dispatch, currentUser?.id]);

  useEffect(() => {
    // Count up animation
    let startTimestamp: number | null = null;
    const duration = 1000;
    const initialPoints = 0;
    const targetPoints = currentUser?.lotte_points || 0;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayPoints(Math.floor(progress * (targetPoints - initialPoints) + initialPoints));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [currentUser?.lotte_points]);

  const levelProgress = Math.min(((currentUser?.lotte_points || 0) / 10000) * 100, 100).toFixed(0);

  if (status === 'loading') {
    return <div className="text-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span><p>Đang tải dữ liệu điểm...</p></div>;
  }
  
  if (status === 'failed') {
    return <div className="text-center py-20 text-red-500"><p>Lỗi tải điểm: {error}</p></div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-0 sm:px-2 py-4">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Điểm thưởng & Ưu đãi thành viên</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Chào mừng trở lại, {currentUser?.full_name || currentUser?.username}. Bạn đang tiến gần hơn đến phần thưởng lớn tiếp theo đấy!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-primary/5 p-6 group">
              <div className="absolute top-0 right-0 p-4">
                <span className="material-symbols-outlined text-6xl text-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  military_tech
                </span>
              </div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                  Thành viên {currentUser?.membership_level || 'Bronze'}
                </span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-primary">{displayPoints.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Điểm</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                      Tiến độ lên mức tiếp theo
                    </span>
                    <span className="text-primary">{levelProgress}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-1000" style={{ width: `${levelProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/5 hover:border-primary transition-all group shadow-sm">
                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                  qr_code_2
                </span>
                <span className="text-xs font-bold uppercase tracking-tight">Hiện ID thành viên</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/5 hover:border-primary transition-all group shadow-sm">
                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                  history
                </span>
                <span className="text-xs font-bold uppercase tracking-tight">Lịch sử đầy đủ</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-primary/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg">Giao dịch gần đây</h3>
                <button className="text-primary text-sm font-semibold hover:underline">Xem tất cả</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs font-bold uppercase">
                      <th className="px-6 py-4">Ngày</th>
                      <th className="px-6 py-4">Nguồn</th>
                      <th className="px-6 py-4">Loại</th>
                      <th className="px-6 py-4 text-right">Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          Chưa có lịch sử giao dịch điểm thưởng.
                        </td>
                      </tr>
                    ) : (
                      transactions.map(t => (
                        <tr key={t.id || (t as any)._id}>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.created_at).toLocaleDateString('vi-VN')}</td>
                          <td className="px-6 py-4 font-semibold">{t.description || t.source || 'Hệ thống'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 ${(t.type === 'EARN' || t.type === 'earn') ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-primary/10 text-primary'} text-[10px] font-black rounded uppercase`}>
                              {(t.type === 'EARN' || t.type === 'earn') ? 'Nhận' : 'Đổi'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${(t.type === 'EARN' || t.type === 'earn') ? 'text-green-600' : 'text-primary'}`}>
                            {(t.type === 'EARN' || t.type === 'earn') ? '+' : '-'}{t.points}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Points Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Đổi điểm thưởng</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Chọn từ hàng trăm phần thưởng độc quyền được thiết kế dành riêng cho bạn.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold shadow-sm">
                Tất cả phần thưởng
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm">Ăn uống</button>
              <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold shadow-sm">
                Điện tử
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Coupon 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-primary/5 group hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-40">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhltiTmSgZqDmAi4pqA5RA4KddI67QuqhBjglDNicMqfHLhdkk5EaUhK3xnsaXtD9B8cLZ8jaCsJpdk1pgn_RS--WLMeF2p4dnZmqfLXszbFeJuUFkf8zFP2ZzsAXz0p2QZwkvRhmoLN02vrtHTvRu4h2YIkoMvU2ccHvzEWpIgHj6enKlh38GZa53wAoN0dRJnxa-i7xbV55kLtL2SA5uSl1Xxx4boTGiutUWMwWeKMGESAJ-XYYVulw9IJ587_-M1q2FPzbs6ys"
                  alt="Fresh fruit platter close up"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded uppercase">
                  Hot Deal
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thực phẩm</p>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 line-clamp-1">Giảm 20$ cho mọi đơn hàng</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-gold text-lg">database</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">2,000 Điểm</span>
                  </div>
                  <button className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-tight">
                    Đổi ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Coupon 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-primary/5 group hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-40">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5UiplLUnkoVqE8NRn_5be8tufonZCAZYnIhzI2IbDyq-vYVVv4JIvSF_2jnaStu_wFmNLRIItCw7wUe9vSPILyuaUWloBmN-QxEJh_0SDMughfILw4d4qRHRS3MStF36L4Tlt52wQdwtxi9Mm_BHiSrdx_Ew8evnHC-GICmAjTmd99i23dIg75KXPoJuS4B8zxhQub1D2urIy_5IYvcOugCN8LuoiZUwHFxrfVcyvjgaKxKZUiIv_Ghh5uMzrP8Ve9tCz3tVIcnI"
                  alt="Steaming coffee cup in cafe"
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phong cách sống</p>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 line-clamp-1">Cà phê Starbucks miễn phí</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-gold text-lg">database</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">850 Điểm</span>
                  </div>
                  <button className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-tight">
                    Đổi ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Coupon 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-primary/5 group hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-40">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIcj7xMHZa1GucQUf3CVDiCAchATo6R_hWE0vVhcU4Q_LCuY61iAYL0bJGy0K_QjJg16GMeV3_fM_q5IyBZ3QHvGswq6KOYx1jeV8CLrk4fl6EbjXwTdekrsD0q3jFSJ9XhetuqSjdzconOmGG7FG1dspoHXwqfjl0VWzVXRsh8wUpLUWVfpm5Z7rbNdUWWDnx_a6wfXm36aSBLREsJCaIewiYixVpvCFRdKOStQ0X2GButhPcrQm4i-V67wiRfFDYIUBqgm9nsJg"
                  alt="Cinema popcorn and movie seats"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-gold text-white text-[10px] font-bold rounded uppercase">
                  Member Exclusive
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giải trí</p>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 line-clamp-1">2 vé xem phim CGV</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-gold text-lg">database</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">3,500 Điểm</span>
                  </div>
                  <button className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-tight">
                    Đổi ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Coupon 4 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-primary/5 group hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-40">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApJt-whY327gAMWaTRebasBXgfAASWqYW8Zt6yk0wZMlAabi5p6bZSz-Y51qhKWOFZ7rN9v7Y0dfLJxW2UXNCmBXxXef7HsS10EzyU4LcXMoW6o3aRP2poHF6Hhb6FSQGBhTWH1t_xO1lchB-fEOAJ6E5oBhnX2XiEo3TttiBgObkljszUKFxqm6zayKlmng1v9NBr2hyaRVzutf7Kfj7vug05wCAUR9Gd287jPnN4F-P08Ra3G8k2XuX3F0Ql1aC1cfS2SrRgonQ"
                  alt="Modern kitchen appliances set"
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nhà cửa & Sống</p>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 line-clamp-1">Nồi chiên không dầu (Bạc)</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-gold text-lg">database</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">15,000 Điểm</span>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed uppercase tracking-tight">
                    Không đủ điểm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
};

export default LoyaltyRewards;