import React, { useState, useEffect } from 'react';
import type { Promotion, Product } from '../../types';
import { Countdown } from '../Countdown/Countdown';
import { dataService } from '../../services/dataService';
import { toast } from '../Toast/toastEvent';
import { useAppSelector } from '../../store';
import { useNavigate } from 'react-router-dom';

interface PromotionDetailModalProps {
  promotion: Promotion;
  onClose: () => void;
  branchIdSelected?: string;
}

export const PromotionDetailModal: React.FC<PromotionDetailModalProps> = ({ promotion, onClose, branchIdSelected = '' }) => {
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    const loadDependencies = async () => {
      if (!promotion.applicable_branch_product_ids?.length) return;
      try {
        const bps = await dataService.getBranchProducts(branchIdSelected);
        const filteredBps = bps.filter(bp => promotion.applicable_branch_product_ids?.includes(Number(bp.id)));
        const pIds = filteredBps.map(bp => bp.product_id);
        const pData = await dataService.getProductsByIds(pIds);
        setProducts(pData);
      } catch (err) {
        console.error(err);
      }
    };
    loadDependencies();
  }, [promotion, branchIdSelected]);

  const handleApply = async () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để áp dụng mã');
      onClose();
      navigate('/login');
      return;
    }
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setApplying(true);
    try {
      const res = await dataService.applyCoupon(couponCode, Number(user.id));
      if (res.success) {
        toast.success(res.message);
        setCouponCode('');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi áp dụng mã');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-64">
          <img 
             alt={promotion.title}
             src={promotion.image_url || "https://source.unsplash.com/random/800x600/?sale,promotion"}
             className="w-full h-full object-cover"
          />
          <button 
             onClick={onClose}
             className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition"
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
            <span className="bg-lotteRed text-white font-bold px-2 py-1 rounded text-xs uppercase mb-2 inline-block shadow-sm">
              Khuyến Mãi
            </span>
            <h2 className="text-white text-2xl font-bold leading-tight">{promotion.title}</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
            <div className="flex items-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
               <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Thời gian còn lại:
            </div>
            <Countdown endDate={promotion.end_date} className="text-xl text-orange-600 dark:text-orange-400" />
          </div>

          <p className="text-gray-600 dark:text-slate-300 mb-6 whitespace-pre-line leading-relaxed">
            {promotion.description}
          </p>

          {(products.length > 0) ? (
             <div className="mb-6">
               <h4 className="font-bold text-gray-900 dark:text-white mb-3">Sản phẩm áp dụng:</h4>
               <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                 {products.map(p => (
                   <div key={p.id} className="w-20 shrink-0 snap-start flex flex-col items-center">
                     <img src={p.images?.[0] || 'https://via.placeholder.com/150'} alt={p.name} className="w-16 h-16 rounded-xl border border-gray-100 dark:border-slate-800 object-cover mb-2" />
                     <span className="text-[10px] line-clamp-2 text-center text-gray-500">{p.name}</span>
                   </div>
                 ))}
               </div>
             </div>
          ) : (
            <div className="mb-6 text-sm text-gray-500 flex items-center justify-center bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl">
              Đang tải sản phẩm hoặc chương trình áp dụng cho toàn nhánh...
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-slate-800 pt-6 mt-2">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Áp dụng mã giảm giá:</h4>
            <div className="flex gap-3">
              <input 
                 type="text" 
                 placeholder="Nhập mã (VD: LOTTE50)" 
                 value={couponCode}
                 onChange={e => setCouponCode(e.target.value)}
                 className="flex-1 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotteRed/50"
              />
              <button 
                 onClick={handleApply}
                 disabled={applying}
                 className="bg-black dark:bg-white text-white dark:text-black font-semibold px-6 rounded-xl hover:opacity-80 transition disabled:opacity-50 text-sm"
              >
                {applying ? 'Đang áp dụng...' : 'Áp dụng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
