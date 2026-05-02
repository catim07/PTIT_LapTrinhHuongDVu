import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loadCoupons } from '../slices/couponSlice';
import { dataService } from '../services/dataService';
import { toast } from '../components/Toast/toastEvent';

const MyCoupons: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: coupons, status, error } = useAppSelector(state => state.coupon);
  const { user: currentUser } = useAppSelector(state => state.auth);

  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [codeInput, setCodeInput] = useState('');
  const [usage, setUsage] = useState<string[]>([]);
  
  useEffect(() => {
    dispatch(loadCoupons());
    if (currentUser) {
      dataService.getCouponUsage().then(usages => {
        setUsage(usages.map(u => String((u as any).coupon_id)));
      });
    }
  }, [dispatch, currentUser]);

  const handleApplyCode = async () => {
    if (!codeInput.trim()) return toast.warning('Vui lòng nhập mã giảm giá');
    try {
      const res = await dataService.applyCoupon(codeInput);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Lỗi khi áp dụng mã giảm giá');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã ${code}`);
  };

  if (status === 'loading') {
    return <div className="text-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span><p>Đang tải...</p></div>;
  }
  
  if (status === 'failed') {
    return <div className="text-center py-20 text-red-500"><p>Lỗi: {error}</p></div>;
  }

  const safeCoupons = Array.isArray(coupons) ? coupons : [];
  
  const filteredCoupons = safeCoupons.filter(c => {
    if (!c) return false;
    const code = c.code || '';
    const isUsed = usage.includes(code);
    const isExpired = c.end_date ? new Date(c.end_date) < new Date() : false;
    const total = Number((c as any).total_quantity || (c as any).usage_limit || 0);
    const usedCount = Number((c as any).used_count || (c as any).claimed_count || 0);
    const remaining = (c as any).remaining_quantity !== undefined && (c as any).remaining_quantity !== null
      ? Number((c as any).remaining_quantity)
      : (total > 0 ? Math.max(0, total - usedCount) : null);
    const isSoldOut = Boolean((c as any).is_sold_out || (remaining !== null && remaining <= 0));
    const isActive = !isUsed && !isExpired && !isSoldOut;
    
    if (filter === 'active') return isActive;
    if (filter === 'used') return isUsed;
    if (filter === 'expired') return isExpired && !isUsed;
    return true;
  });

  return (
    <main className="space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Mã giảm giá của tôi
              </h1>
              <p className="text-slate-500">Quản lý và sử dụng các mã ưu đãi dành riêng cho bạn</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  local_activity
                </span>
                <input
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 bg-white dark:bg-background-dark dark:border-primary/20 text-sm"
                  placeholder="Nhập mã giảm giá..."
                  type="text"
                />
              </div>
              <button 
                onClick={handleApplyCode}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/10 shrink-0"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {/* Tabs Filter */}
          <div className="border-b border-slate-200 dark:border-primary/10">
            <div className="flex gap-8 overflow-x-auto pb-px">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'active', label: 'Còn hạn' },
                { id: 'used', label: 'Đã dùng' },
                { id: 'expired', label: 'Hết hạn' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`border-b-2 px-2 py-4 font-bold text-sm whitespace-nowrap ${filter === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coupon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCoupons.map(coupon => {
              if (!coupon) return null;
              const code = coupon.code || '';
              const isUsed = usage.includes(code);
              const isExpired = coupon.end_date ? new Date(coupon.end_date) < new Date() : false;
              const total = Number((coupon as any).total_quantity || (coupon as any).usage_limit || 0);
              const usedCount = Number((coupon as any).used_count || (coupon as any).claimed_count || 0);
              const remaining = (coupon as any).remaining_quantity !== undefined && (coupon as any).remaining_quantity !== null
                ? Number((coupon as any).remaining_quantity)
                : (total > 0 ? Math.max(0, total - usedCount) : null);
              const isSoldOut = Boolean((coupon as any).is_sold_out || (remaining !== null && remaining <= 0));
              const isActive = !isUsed && !isExpired && !isSoldOut;
              const discountType = (coupon as any).discount_type || (coupon as any).type || 'fixed_amount';
              const discountValue = Number((coupon as any).discount_value || 0);
              const minOrderAmount = Number((coupon as any).min_order_value || (coupon as any).min_order_amount || 0);

              return (
                <div key={coupon.id || Math.random()} className={`bg-white dark:bg-background-dark/40 rounded-xl overflow-hidden shadow-sm flex border border-slate-200 dark:border-primary/10 relative ${!isActive ? 'grayscale opacity-75' : 'hover:shadow-md transition-shadow'}`}>
                  <div className={`w-32 flex flex-col items-center justify-center border-r border-dashed border-slate-300 dark:border-primary/20 p-4 shrink-0 ${isActive ? 'bg-primary/5 dark:bg-primary/10' : 'bg-slate-100 dark:bg-slate-800/50'}`}>
                    {discountType === 'percent' ? (
                      <span className={`font-black text-2xl ${isActive ? 'text-primary' : 'text-slate-400'}`}>{discountValue}%</span>
                    ) : (
                      <span className={`font-black text-xl ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                        {discountValue > 1000 ? `${discountValue / 1000}K` : discountValue}
                      </span>
                    )}
                    <span className={`text-[10px] uppercase font-bold tracking-tighter mt-1 ${isActive ? 'text-primary/60' : 'text-slate-400'}`}>Giảm giá</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{code.toUpperCase()}</h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${isActive ? 'bg-emerald-100 text-emerald-700' : isUsed ? 'bg-slate-200 text-slate-600' : isSoldOut ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                          {isActive ? 'Còn hạn' : isUsed ? 'Đã dùng' : isSoldOut ? 'Hết lượt' : 'Hết hạn'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{coupon.description || ''}</p>
                      <p className="text-[11px] text-slate-400 mt-2">Đơn hàng tối thiểu: {minOrderAmount.toLocaleString()}đ</p>
                      {total > 0 && (
                         <p className="text-[11px] text-slate-400 mt-1">Còn lại: {Number(remaining || 0).toLocaleString('vi-VN')} / {Number(total).toLocaleString('vi-VN')}</p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-primary/5 pt-4">
                      <span className="text-[11px] text-slate-500">
                           {isUsed ? 'Đã dùng' : isActive ? 'HSD:' : isSoldOut ? 'Hết lượt:' : 'Đã hết hạn:'} {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                      </span>
                      <div className="flex gap-2">
                        {isActive ? (
                           <>
                             <button onClick={() => copyToClipboard(code)} className="size-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                             </button>
                             <button onClick={() => { setCodeInput(code); handleApplyCode(); }} className="bg-primary text-white text-[12px] font-bold px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                                Sử dụng ngay
                             </button>
                           </>
                        ) : (
                           <button className="bg-slate-200 text-slate-500 cursor-not-allowed text-[12px] font-bold px-4 py-1.5 rounded-lg" disabled>
                             {isSoldOut ? 'Hết lượt' : 'Sử dụng ngay'}
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background-light dark:bg-background-dark border border-slate-200 dark:border-primary/10"></div>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background-light dark:bg-background-dark border border-slate-200 dark:border-primary/10"></div>
                </div>
              );
            })}
          </div>

          {filteredCoupons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="size-20 bg-slate-100 dark:bg-primary/5 rounded-full flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Không tìm thấy mã giảm giá</h3>
                <p className="text-slate-500 text-sm">Hãy kiểm tra lại bộ lọc hoặc thử mã khác</p>
              </div>
            </div>
          )}
      </div>
    </main>
  );
};

export default MyCoupons;