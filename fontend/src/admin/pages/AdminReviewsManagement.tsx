import React, { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../../services/reviewService';
import { toast } from '../../components/Toast/toastEvent';
import { 
  PageHeader, SearchBar, FilterBar, StatusBadge, EmptyState, 
  LoadingOverlay, PaginationControl, Modal, DetailDrawer, 
  FormSection, FormField, StatCard, cls, AdminErrorBoundary 
} from '../components/AdminUI';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'published', label: 'Đã duyệt' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'hidden', label: 'Đã ẩn' },
  { value: 'reported', label: 'Bị báo cáo' },
  { value: 'active', label: 'Active (Cũ)' },
  { value: 'flagged', label: 'Flagged (Cũ)' }
];

const AdminReviewsManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  
  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  // Detail & Modals
  const [detailReview, setDetailReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [statusChangeModal, setStatusChangeModal] = useState<{ id: string, status: string, label: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        reviewService.stats(),
        reviewService.listAll({ page, limit: 15, search, status: statusFilter })
      ]);
      setStats(statsRes || {});
      setReviews(listRes?.data || []);
      setTotal(listRes?.meta?.total || 0);
    } catch {
      toast.error('Lỗi tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeModal) return;
    try {
      await reviewService.updateStatus(statusChangeModal.id, { 
        status: statusChangeModal.status,
        moderation_reason: moderationReason
      });
      toast.success(`Đã cập nhật trạng thái thành ${statusChangeModal.label}`);
      setStatusChangeModal(null);
      setModerationReason('');
      if (detailReview) {
        setDetailReview((prev: any) => ({ ...prev, status: statusChangeModal.status, moderation_reason: moderationReason }));
      }
      loadData();
    } catch {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const submitReply = async () => {
    if (!detailReview || !replyText.trim()) return;
    try {
      const res = await reviewService.reply(detailReview._id || detailReview.id, { content: replyText });
      toast.success('Đã gửi phản hồi');
      setDetailReview(res.data);
      setReplyText('');
      loadData();
    } catch {
      toast.error('Lỗi phản hồi');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': case 'active': return 'success';
      case 'pending': return 'warning';
      case 'hidden': return 'slate';
      case 'reported': case 'flagged': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <AdminErrorBoundary>
      <div className="p-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Quản Lý Đánh Giá" 
          subtitle="Theo dõi và kiểm duyệt đánh giá khách hàng"
          breadcrumbs={['Quản trị', 'Đánh giá']}
        />

        {/* STATS */}
        <div className="grid grid-cols-5 gap-4">
          <StatCard title="Tổng Đánh Giá" value={stats.total || 0} icon="rate_review" color="primary" />
          <StatCard title="Điểm Trung Bình" value={stats.avgRating || 0} icon="star" color="amber" />
          <StatCard title="Trạng Thái Chờ" value={stats.pending || 0} icon="pending_actions" color="warning" />
          <StatCard title="Đã Báo Cáo" value={stats.flagged || 0} icon="flag" color="danger" />
          <StatCard title="Đã Duyệt" value={stats.published || 0} icon="check_circle" color="success" />
        </div>

        {/* TOOLBAR */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder="Tìm theo sản phẩm, nội dung..." 
          />
          <FilterBar 
            filters={[
              {
                label: 'Tất cả trạng thái',
                value: statusFilter,
                options: STATUS_OPTIONS,
                onChange: setStatusFilter
              }
            ]}
          />
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 relative min-h-[400px]">
          {loading && <LoadingOverlay visible={loading} />}
          
          {reviews.length === 0 && !loading ? (
            <EmptyState icon="reviews" title="Chưa có đánh giá nào" />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Sản Phẩm / Khách</th>
                  <th className="px-6 py-4">Đánh Giá</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4">Thời Gian</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                 {reviews.map(r => (
                   <tr key={r._id || r.id} className="hover:bg-slate-50/50">
                     <td className="px-6 py-4 max-w-[200px] truncate">
                        <div className="font-bold text-slate-800 truncate">{r.product_name || `SP #${r.product_id}`}</div>
                        <div className="text-xs text-slate-500 truncate">{r.user_name || r.user_id}</div>
                     </td>
                     <td className="px-6 py-4 max-w-[250px] truncate">
                        <div className="flex text-amber-400 mb-1">
                          {Array.from({length: 5}).map((_, i) => <span key={i} className="material-symbols-outlined text-[14px]">{i < r.rating ? 'star' : 'star_border'}</span>)}
                        </div>
                        <div className="truncate text-slate-600" title={r.content}>{r.content}</div>
                     </td>
                     <td className="px-6 py-4">
                        <StatusBadge status={getStatusColor(r.status)} label={r.status} />
                        {r.reported_count > 0 && <span className="ml-2 text-xs text-red-500 font-bold">({r.reported_count} reports)</span>}
                     </td>
                     <td className="px-6 py-4 text-slate-500">
                        {format(new Date(r.created_at || new Date()), 'dd/MM/yyyy HH:mm')}
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => setDetailReview(r)} className="text-primary font-bold hover:underline">Chi tiết</button>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          )}
        </div>
        <PaginationControl page={page} total={total} pageSize={15} onChange={setPage} />
      </div>

      {/* DETAIL DRAWER */}
      <DetailDrawer
        open={!!detailReview}
        onClose={() => setDetailReview(null)}
        title="Chi tiết đánh giá"
      >
         {detailReview && (
           <div className="space-y-6">
             <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <img src={detailReview.user_avatar || 'https://ui-avatars.com/api/?name=User'} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{detailReview.user_name || detailReview.user_id}</div>
                  <div className="text-sm text-slate-500">{detailReview.product_name || 'N/A'}</div>
                </div>
             </div>

             <div className="p-4 border border-slate-100 rounded-lg">
               <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-amber-400">
                    {Array.from({length: 5}).map((_, i) => <span key={i} className="material-symbols-outlined text-lg">{i < detailReview.rating ? 'star' : 'star_border'}</span>)}
                  </div>
                  <StatusBadge status={getStatusColor(detailReview.status)} label={detailReview.status} />
               </div>
               <div className="font-bold text-lg mb-1">{detailReview.title}</div>
               <div className="text-slate-700 whitespace-pre-wrap">{detailReview.content}</div>
               
               {detailReview.images?.length > 0 && (
                 <div className="flex gap-2 mt-4">
                   {detailReview.images.map((img: string, i: number) => (
                     <img key={i} src={img} alt="review attachment" className="w-20 h-20 object-cover rounded-lg border border-slate-200 cursor-pointer hover:border-primary" />
                   ))}
                 </div>
               )}
             </div>

             <FormSection title="Phản hồi từ cửa hàng">
                {detailReview.reply?.content ? (
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-500 font-bold mb-1 uppercase tracking-wider">{detailReview.reply.admin_name || 'Admin'} • {format(new Date(detailReview.reply.replied_at), 'dd/MM/yyyy HH:mm')}</div>
                    <div className="text-slate-800">{detailReview.reply.content}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea 
                      className={cls.input + ' min-h-[100px]'} 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)} 
                      placeholder="Nhập nội dung phản hồi khách hàng..."
                    />
                    <button onClick={submitReply} className={cls.btnPrimary + ' w-full'}>Gửi Phản Hồi</button>
                  </div>
                )}
             </FormSection>

             <FormSection title="Hành động kiểm duyệt">
               <div className="grid grid-cols-2 gap-2">
                 {detailReview.status !== 'published' && (
                   <button 
                     onClick={() => setStatusChangeModal({ id: detailReview._id || detailReview.id, status: 'published', label: 'Duyệt' })} 
                     className={cls.btnSecondary + ' !text-green-600'}
                   >
                     <span className="material-symbols-outlined text-sm">check_circle</span> Duyệt
                   </button>
                 )}
                 {detailReview.status !== 'hidden' && (
                   <button 
                     onClick={() => setStatusChangeModal({ id: detailReview._id || detailReview.id, status: 'hidden', label: 'Ẩn' })} 
                     className={cls.btnSecondary + ' !text-orange-600'}
                   >
                     <span className="material-symbols-outlined text-sm">visibility_off</span> Ẩn
                   </button>
                 )}
                 <button 
                   onClick={() => setStatusChangeModal({ id: detailReview._id || detailReview.id, status: 'deleted', label: 'Xóa' })} 
                   className={cls.btnSecondary + ' !text-red-600 !border-red-200 col-span-2'}
                 >
                   <span className="material-symbols-outlined text-sm">delete</span> Xóa Đánh Giá
                 </button>
               </div>
             </FormSection>
           </div>
         )}
      </DetailDrawer>

      {/* STATUS CHANGE MODAL */}
      <Modal
        open={!!statusChangeModal}
        onClose={() => { setStatusChangeModal(null); setModerationReason(''); }}
        title={`Xác nhận: ${statusChangeModal?.label}`}
        footer={
          <>
            <button onClick={() => { setStatusChangeModal(null); setModerationReason(''); }} className={cls.btnSecondary}>Hủy</button>
            <button type="submit" form="change-status-form" className={cls.btnPrimary}>Xác nhận</button>
          </>
        }
      >
        <form id="change-status-form" onSubmit={handleUpdateStatus} className="space-y-4">
          <p className="text-slate-600">Bạn chuẩn bị chuyển trạng thái đánh giá này thành <strong>{statusChangeModal?.label}</strong>.</p>
          <FormField label="Lý do / Ghi chú (không bắt buộc)">
             <textarea 
               className={cls.input} 
               value={moderationReason} 
               onChange={e => setModerationReason(e.target.value)} 
               placeholder="Nhập lý do kiểm duyệt nếu cần..."
               rows={3}
             />
          </FormField>
        </form>
      </Modal>

    </div>
    </AdminErrorBoundary>
  );
};

export default AdminReviewsManagement;
