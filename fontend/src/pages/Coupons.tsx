import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';
import { toast } from '../components/Toast/toastEvent';


const Coupons: React.FC = () => {
  const { t } = useTranslation();
    const { data: coupons } = useAppSelector(state => state.coupon);
    const [copiedId, setCopiedId] = useState<string | number | null>(null);

    const handleCopy = async (code: string, id: string | number) => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        toast.success(`Đã sao chép mã "${code}"`);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        toast.error('Không thể sao chép, vui lòng thử lại');
      }
    };

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">{t('coupons.walletTitle')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="border-l-4 border-primary bg-white shadow-sm p-4 rounded-r-xl flex items-center justify-between">
                        {(() => {
                          const total = Number((coupon as any).total_quantity || (coupon as any).usage_limit || 0);
                          const used = Number((coupon as any).used_count || (coupon as any).claimed_count || 0);
                          const remaining = (coupon as any).remaining_quantity !== undefined && (coupon as any).remaining_quantity !== null
                            ? Number((coupon as any).remaining_quantity)
                            : (total > 0 ? Math.max(0, total - used) : null);
                          const soldOut = Boolean((coupon as any).is_sold_out || (remaining !== null && remaining <= 0));
                          const expired = Boolean(coupon.end_date && new Date(coupon.end_date) < new Date());
                          return (
                            <>
                        <div>
                            <h3 className="font-bold text-lg">{coupon.code}</h3>
                      <p className="text-slate-500 text-sm">Giảm {(coupon.discount_type || coupon.type) === 'percent' ? `${coupon.discount_value}%` : `${coupon.discount_value.toLocaleString('vi-VN')}đ`}</p>
                      <p className="text-xs text-slate-400 mt-2">HSD: {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn'}</p>
                      {total > 0 && <p className="text-xs text-slate-400 mt-1">Còn lại: {Number(remaining || 0).toLocaleString('vi-VN')} / {Number(total).toLocaleString('vi-VN')}</p>}
                      {soldOut && <p className="text-xs text-red-500 font-semibold mt-1">{t('coupons.fullyUsed')}</p>}
                      {!soldOut && expired && <p className="text-xs text-orange-500 font-semibold mt-1">{t('coupons.expired')}</p>}
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code, coupon.id)}
                          className={`font-bold px-4 py-2 rounded transition-all ${(soldOut || expired) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : copiedId === coupon.id ? 'bg-emerald-50 text-emerald-600' : 'text-primary hover:bg-primary/5'}`}
                          disabled={soldOut || expired}
                        >
                          {copiedId === coupon.id ? '✓ Đã copy' : 'Copy'}
                        </button>
                            </>
                          );
                        })()}
                    </div>
                ))}
            </div>
        </>
    );
};
export default Coupons;
