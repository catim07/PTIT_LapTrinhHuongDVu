import React from 'react';
import type { Promotion } from '../../types';
import { PromotionCard } from '../PromotionCard/PromotionCard';

interface PromotionGridProps {
  promotions: Promotion[];
  loading: boolean;
  branchIdSelected?: string;
  onViewDetail: (p: Promotion) => void;
}

export const PromotionGrid: React.FC<PromotionGridProps> = ({ promotions, loading, branchIdSelected, onViewDetail }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm h-96 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-slate-800 w-full" />
            <div className="p-5 flex flex-col gap-3">
              <div className="h-6 bg-gray-200 dark:bg-slate-800 w-3/4 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-slate-800 w-full rounded" />
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-800" />
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center">
        <svg className="w-24 h-24 mb-4 text-gray-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-gray-500 dark:text-slate-400 mb-6">Chưa có chương trình khuyến mãi nào phù hợp</p>
        <button className="px-8 py-3 border-2 border-lotteRed text-lotteRed font-bold rounded-xl hover:bg-lotteRed hover:text-white transition duration-300" onClick={() => window.location.href='/products'}>
          Xem tất cả sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {promotions.map(p => (
        <PromotionCard 
          key={p.id} 
          promotion={p} 
          branchIdSelected={branchIdSelected}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
};
