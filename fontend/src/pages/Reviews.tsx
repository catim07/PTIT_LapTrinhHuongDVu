import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { toast } from 'react-toastify';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await dataService.getReviews();
        setReviews(res || []);
      } catch (err: any) {
        toast.error('Lỗi tải đánh giá');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Đánh giá của tôi</h1>
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-primary/10">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">rate_review</span>
          <p className="text-slate-500 font-medium">Bạn chưa có đánh giá nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="p-5 bg-white dark:bg-slate-900 border border-primary/10 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2 gap-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                  Sản phẩm #{review.product_id ?? review.branch_product_id}
                </h3>
                <div className="flex text-yellow-400 shrink-0">
                  {Array.from({ length: Math.min(review.rating ?? 0, 5) }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm fill-1">star</span>
                  ))}
                  {Array.from({ length: Math.max(0, 5 - (review.rating ?? 0)) }).map((_, i) => (
                    <span key={`e-${i}`} className="material-symbols-outlined text-sm text-slate-200">star</span>
                  ))}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">{review.comment}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(review.created_at).toLocaleString('vi-VN')}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Reviews;
