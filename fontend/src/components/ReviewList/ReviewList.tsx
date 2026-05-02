import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchReviewsForProduct, addReview, replyToReview } from '../../slices/reviewSlice';
import ReviewCard from '../ReviewCard/ReviewCard';
import { toast } from '../Toast/toastEvent';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';

interface ReviewListProps {
  productId: number | string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const reviewsState = useAppSelector(state => state.review.data[String(productId)]);
  const status = useAppSelector(state => state.review.status);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    dispatch(fetchReviewsForProduct(productId));
  }, [dispatch, productId]);

  const reviews = reviewsState || [];
  
  // Sort reviews: newest first
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const paginatedReviews = sortedReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  const canReply = user?.role_id === 1 || user?.role_id === 2;

  const handleReplyReview = async (reviewId: string | number, text: string) => {
    try {
      await dispatch(replyToReview({ reviewId, payload: { text } })).unwrap();
      toast.success("Đã gửi phản hồi đánh giá");
    } catch {
      toast.error("Gửi phản hồi thất bại");
    }
  };

  const submitReview = async () => {
    if (isSubmitting) return;
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để viết đánh giá");
      localStorage.setItem('pending_review', newReview.comment);
      navigate('/login');
      return;
    }

    if (newReview.comment.trim().length < 10) {
      toast.warning("Vui lòng nhập đánh giá ít nhất 10 ký tự!");
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await dataService.uploadReviewImages(imageFiles);
      }

      await dispatch(addReview({ 
        productId: productId, 
        payload: {
          user_id: user?.id,
          user_name: user?.full_name || user?.username,
          avatar: user?.avatar,
          rating: newReview.rating,
          content: newReview.comment,
          comment: newReview.comment,
          images: imageUrls,
        }
      })).unwrap();
      
      setNewReview({ rating: 5, comment: '' });
      setImageFiles([]);
      toast.success("Cảm ơn bạn đã chia sẻ đánh giá!");
    } catch {
      toast.error("Gửi đánh giá thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-8">Đánh giá khách hàng ({reviews.length})</h3>

      {status === 'loading' && <div className="py-4 text-center">Đang tải đánh giá...</div>}
      
      {paginatedReviews.length === 0 && status !== 'loading' ? (
        <div className="py-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl mb-8">Chưa có đánh giá nào cho sản phẩm này.</div>
      ) : (
        <>
          <div className="space-y-8 mb-8">
            {paginatedReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                canReply={canReply} 
                onReply={handleReplyReview} 
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mb-12">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Trang trước
              </button>
              <div className="px-3 py-1">
                Trang {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Trang tiếp
              </button>
            </div>
          )}
        </>
      )}

      {/* Write Review Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h4 className="font-bold mb-4">Viết đánh giá của bạn</h4>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
              className={`text-4xl transition-colors ${newReview.rating >= star ? 'text-yellow-500' : 'text-slate-300'}`}
              aria-label={`Rate ${star} stars`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={newReview.comment}
          onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm (tối thiểu 10 ký tự)..."
          className="w-full h-32 p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary resize-y"
        />

        <div className="mt-3">
          <label className="block text-sm font-semibold mb-2">Ảnh đánh giá (tối đa 5 ảnh)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 5);
              setImageFiles(files);
            }}
            className="block w-full text-sm"
          />
          {imageFiles.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {imageFiles.map((file, idx) => (
                <span key={`${file.name}-${idx}`} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={submitReview}
          disabled={isSubmitting}
          className="mt-4 w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold disabled:opacity-60"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </div>
  );
};

export default ReviewList;
