import React, { useEffect, useState } from 'react';
import type { Promotion, Product, BranchProduct } from '../../types';
import { dataService } from '../../services/dataService';
import { Countdown } from '../Countdown/Countdown';
import { useAppDispatch, useAppSelector, store } from '../../store';
import { useNavigate } from 'react-router-dom';
import { toast } from '../Toast/toastEvent';
import { addToCartAsync } from '../../slices/cartSlice';

interface PromotionCardProps {
  promotion: Promotion;
  branchIdSelected?: string;
  onViewDetail?: (p: Promotion) => void;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, branchIdSelected = '', onViewDetail }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    let isMounted = true;
    const loadDependencies = async () => {
      if (!promotion.applicable_branch_product_ids?.length) return;
      try {
        const bps = await dataService.getBranchProducts(branchIdSelected);
        const filteredBps = bps.filter(bp => promotion.applicable_branch_product_ids?.includes(Number(bp.id)));
        
        const pIds = filteredBps.map(bp => bp.product_id);
        const pData = await dataService.getProductsByIds(pIds);

        if (isMounted) {
          setBranchProducts(filteredBps);
          setProducts(pData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadDependencies();
    return () => { isMounted = false; };
  }, [promotion, branchIdSelected]);

  const handleBuy = async () => {
    const { isAuthenticated, user: authUser } = store.getState().auth;
    if (!user && !isAuthenticated && !authUser) {
      toast.info('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    
    if (branchProducts.length > 0) {
      try {
        const bp = branchProducts[0];
        const product = products.find(p => p.id === bp.product_id);
        await dispatch(addToCartAsync({
          branchId: branchIdSelected,
          branch_product_id: String(bp.id),
          price: bp.price || 0,
          unit_price: bp.price || 0,
          quantity: 1,
          product_name: product?.name || '',
          product_image: product?.images?.[0] || '',
          branchProduct: bp as any,
        })).unwrap();
        toast.success('Đã thêm vào giỏ hàng');
      } catch (err: any) {
        toast.error(typeof err === 'string' ? err : (err?.message || 'Lỗi thêm vào giỏ'));
      }
    } else {
      toast.error('Sản phẩm không có sẵn');
    }
  };

  // Computations
  const primaryBp = branchProducts[0];
  const primaryP = products.find(p => p.id === primaryBp?.product_id);

  let displayedPrice = primaryBp?.price ?? (primaryP as any)?.price ?? 0;
  let originalPrice = primaryBp?.original_price ?? (primaryP as any)?.original_price ?? null;
  const soldCount = (primaryBp as any)?.sold_count ?? (primaryP as any)?.sold_count ?? 0;
  const promotionValue = Number(promotion.value ?? promotion.discount_value ?? 0);

  // Apply discount if type percent
  if (originalPrice === null && promotion.discount_type === 'percent') {
    originalPrice = displayedPrice;
    displayedPrice = originalPrice - (originalPrice * promotionValue / 100);
  } else if (promotion.discount_type === 'percent' && originalPrice) {
    // maybe recalculate or just use database values
    displayedPrice = originalPrice - (originalPrice * promotionValue / 100);
  }

  const badgeText = promotion.discount_type === 'percent' ? `SALE ${promotionValue}%` : `GIẢM ${promotionValue.toLocaleString()}đ`;
  const badgeClass = promotion.discount_type === 'percent' ? 'bg-red-600' : 'bg-yellow-400 text-black';

  return (
    <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 flex flex-col h-full border border-gray-100 dark:border-slate-800 transition-all cursor-pointer" onClick={() => onViewDetail && onViewDetail(promotion)}>
      <div className="relative h-48 overflow-hidden">
        <img
          alt={promotion.title}
          className="w-full h-full object-cover"
          src={promotion.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAknACQUwTPPOwvArBnEePsJUTt-e9vvJsOGElqtoY19ShvSYCzqflsJr3g75YDaHlnsoceRYhvs-q_L1NIbsr_SnauQ4yuSwb8W9xZbVVJK9gyAr96ZSZFfjIC4E-QYBMK-wNxQ7fgWLVDQw4e_voDZnguFTI2hwLwNB8xC0tIx9z6XXki8CJrN0rCHJ3AIWbM5Ayq28bKfLqAoSTbzQam97svhAvcoToFJ_pE8PSiU98CfREHtcMDrHZMOYgb9_-d8KAbdtoXy8I"}
        />
        <span className={`absolute top-3 left-3 font-bold px-2 py-1 rounded text-xs uppercase shadow-sm ${badgeClass} ${promotion.discount_type === 'percent' ? 'text-white' : ''}`}>
          {badgeText}
        </span>
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white py-1 px-3 flex justify-between items-center text-xs">
          <span>Kết thúc sau:</span>
          <Countdown endDate={promotion.end_date} />
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2">
          {promotion.title}
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
          {promotion.description}
        </p>
        <div className="flex items-center space-x-2 mb-4">
          {products.slice(0, 3).map(p => (
            <img
              key={p.id}
              alt={p.name}
              className="w-12 h-12 rounded-lg border border-gray-100 dark:border-slate-700 object-cover"
              src={p.images?.[0] || 'https://via.placeholder.com/150'}
            />
          ))}
          {products.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-gray-400">
              +{products.length - 3}
            </div>
          )}
        </div>
        <div className="mt-auto">
          <div className="flex items-end justify-between mb-3">
            <div>
                {promotion.discount_type === 'percent' ? (
                  <span className="text-lotteRed text-2xl font-extrabold">-{promotionValue}%</span>
                ) : (
                  <span className="text-lotteRed text-2xl font-extrabold">{displayedPrice.toLocaleString()}đ</span>
                )}
              {originalPrice !== null && (
                 <span className="text-gray-400 line-through text-sm ml-2">{originalPrice.toLocaleString()}đ</span>
              )}
            </div>
            <span className="text-gray-400 text-xs">Đã bán {soldCount}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mb-4 overflow-hidden">
            <div className="bg-lotteRed h-full w-3/4 rounded-full"></div>
          </div>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); handleBuy(); }}
            className="w-full bg-lotteRed text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
};
