import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { eventService } from '../services/eventService';
import { toast } from '../components/Toast/toastEvent';
import { useAppSelector } from '../store';

/* ─── Lightbox ───────────────────────────────────────────────── */
const Lightbox: React.FC<{ images: string[]; index: number; onClose: () => void }> = ({ images, index, onClose }) => {
  const [cur, setCur] = useState(index);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') setCur(p => Math.min(p + 1, images.length - 1)); if (e.key === 'ArrowLeft') setCur(p => Math.max(p - 1, 0)); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [images.length, onClose]);
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white z-10" aria-label="Đóng">
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>
      <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img src={images[cur]} alt="" className="w-full max-h-[80vh] object-contain rounded-xl" />
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button disabled={cur === 0} onClick={() => setCur(p => p - 1)} className="text-white disabled:opacity-30"><span className="material-symbols-outlined text-3xl">chevron_left</span></button>
            <span className="text-white text-sm font-medium">{cur + 1} / {images.length}</span>
            <button disabled={cur === images.length - 1} onClick={() => setCur(p => p + 1)} className="text-white disabled:opacity-30"><span className="material-symbols-outlined text-3xl">chevron_right</span></button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Time ago helper ────────────────────────────────────────── */
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(d).toLocaleDateString('vi-VN');
};

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector(s => s.auth);

  const [post, setPost] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [postDetail, setPostDetail] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Lightbox
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // PDF
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats] = await Promise.all([dataService.getEventCategories()]);
        const formattedCats = cats.map((c: any) => typeof c === 'object' ? c : { id: c, name: String(c).charAt(0).toUpperCase() + String(c).slice(1) });
        setCategories(formattedCats);

        const found = await eventService.getEventDetail(id || '');
        if (!found) { setNotFound(true); setLoading(false); return; }
        setPost(found);

        const postId = found.id || found._id;
        const [detail, cmts, related] = await Promise.all([
          dataService.getEventPostDetail(postId),
          dataService.getEventComments(postId),
          dataService.getRelatedEventPosts(postId),
        ]);
        setPostDetail(detail);
        setComments(cmts);
        setRelatedPosts(related);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  // ─── PDF Export ───────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!printRef.current || !post) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const scaledH = imgH * ratio;
      let y = 0;
      while (y < scaledH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -y, pdfW, scaledH);
        y += pdfH;
      }
      pdf.save(`${post.slug || post.id || post._id}.pdf`);
      toast.success('Đã tải PDF thành công!');
    } catch (e: any) {
      console.error(e);
      toast.error('Không thể tạo PDF. Đang mở chế độ in...');
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  // ─── Comment submit ───────────────────────────────────────────
  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;
    setCommentLoading(true);
    try {
      const newComment = await dataService.addEventComment({
        post_id: post.id || post._id,
        user_id: user?.id || 0,
        user_name: user?.full_name || user?.username || 'Khách',
        avatar: user?.avatar || 'https://i.pravatar.cc/100?img=0',
        content: commentText.trim(),
      });
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      toast.success('Đã đăng bình luận!');
    } catch {
      toast.error('Không thể đăng bình luận');
    } finally {
      setCommentLoading(false);
    }
  };

  // ─── Block renderer ───────────────────────────────────────────
  const renderBlock = (block: any, idx: number) => {
    switch (block.type) {
      case 'title':
        return <h2 key={idx} className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{block.text}</h2>;
      case 'section_title':
        return <h3 key={idx} className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-6">{block.text}</h3>;
      case 'paragraph':
      case 'intro':
        return <p key={idx} className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-8">{block.text}</p>;
      case 'list':
        return (
          <ul key={idx} className="list-disc pl-6 space-y-3 mb-8 text-slate-700 dark:text-slate-300">
            {block.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
          </ul>
        );
      case 'ingredients':
        return (
          <div key={idx} className="mb-10">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">grocery</span>
              Nguyên liệu cần chuẩn bị
            </h4>
            <ul className="list-disc pl-6 space-y-3 text-slate-700 dark:text-slate-300">
              {block.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        );
      case 'steps':
        return (
          <div key={idx} className="mb-12">
            <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">format_list_numbered</span>
              Cách thực hiện chi tiết
            </h4>
            <div className="space-y-8">
              {block.items.map((step: any, i: number) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">{i + 1}</div>
                  <div>
                    <h5 className="font-bold text-lg mb-2">{step.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'tips':
        return (
          <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 mb-10">
            <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              Mẹo hay từ Lotte Mart
            </h4>
            <ul className="space-y-4">
              {block.items.map((tip: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'image':
        return (
          <div key={idx} className="my-12">
            <img
              src={block.url}
              alt={block.alt || ''}
              className="w-full rounded-2xl shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => { setLightboxImages([block.url]); setLightboxIndex(0); }}
            />
          </div>
        );
      case 'gallery':
        return (
          <div key={idx} className="grid grid-cols-2 md:grid-cols-2 gap-4 my-12">
            {block.images.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                alt={`Gallery ${i + 1}`}
                className="rounded-2xl shadow-md w-full cursor-pointer hover:opacity-90 transition-opacity aspect-video object-cover"
                onClick={() => { setLightboxImages(block.images); setLightboxIndex(i); }}
              />
            ))}
          </div>
        );
      case 'cta':
        return (
          <div key={idx} className="my-12 text-center">
            <Link
              to={block.url || '/'}
              className="inline-flex items-center px-10 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all text-lg shadow-xl shadow-primary/30"
            >
              {block.text} <span className="material-symbols-outlined ml-3">arrow_forward</span>
            </Link>
          </div>
        );
      case 'quote':
        return (
          <blockquote key={idx} className="border-l-4 border-primary pl-6 my-8 italic text-slate-600 dark:text-slate-400 text-lg">
            {block.text}
          </blockquote>
        );
      default:
        return null;
    }
  };

  const category = categories.find((c: any) => c.id === post?.category || c.id === post?.category_id);
  const formatDate = (d?: string) => { if (!d) return ''; try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  // ─── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-16">
            <div className="lg:col-span-4 aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="max-w-[720px] mx-auto space-y-6">
            {[1,2,3,4].map(i => <div key={i} className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />)}
          </div>
        </div>
      </main>
    );
  }

  // ─── 404 ──────────────────────────────────────────────────────
  if (notFound || !post) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">article</span>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Không tìm thấy sự kiện</h1>
        <p className="text-slate-500 mb-6">Bài viết không tồn tại hoặc đã bị gỡ.</p>
        <Link to="/featured-events" className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity">
          Quay lại danh sách sự kiện
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 flex-wrap" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link to="/featured-events" className="hover:text-primary transition-colors">Sự kiện nổi bật</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Printable content ref */}
      <div ref={printRef}>
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-center mb-16">
          <div className="lg:col-span-4">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-200">
              <img
                alt={post.thumbnail_alt || post.title}
                className="w-full h-full object-cover"
                src={post.thumbnail || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600'}
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full tracking-wider">
                  {category?.name?.toUpperCase() || 'SỰ KIỆN'}
                </span>
                {post.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Nổi bật
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-slate-900 dark:text-white mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  {post.author_avatar && <img src={post.author_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />}
                  <span>{post.author_name || 'Ban Quản Trị Lotte Mart'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  <span>{formatDate(post.published_at) || `${post.start_date} ${post.end_date ? `- ${post.end_date}` : ''}`}</span>
                </div>
                {post.read_time && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>{post.read_time} phút đọc</span>
                  </div>
                )}
                {post.views != null && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">visibility</span>
                    <span>{post.views.toLocaleString()} lượt xem</span>
                  </div>
                )}
                {post.likes != null && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    <span>{post.likes.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Event period */}
              {(post.start_date || post.end_date) && (
                <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-lg w-fit">
                  <span className="material-symbols-outlined text-base">event</span>
                  Áp dụng: {post.start_date} {post.end_date ? `→ ${post.end_date}` : '— Đang diễn ra'}
                </div>
              )}

              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                {post.excerpt}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-2 print:hidden">
              <a
                href="#content"
                className="flex items-center justify-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
              >
                Đọc bài
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Đã sao chép link!'); }}
                className="flex items-center justify-center px-8 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2"
                aria-label="Chia sẻ bài viết"
              >
                <span className="material-symbols-outlined text-xl">share</span>
                Chia sẻ
              </button>
              <button
                onClick={handleExportPDF}
                disabled={pdfLoading}
                className="flex items-center justify-center px-8 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2 disabled:opacity-50"
                aria-label="Xuất PDF"
              >
                <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                {pdfLoading ? 'Đang tạo...' : 'Xuất PDF'}
              </button>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <article id="content" className="max-w-[720px] mx-auto content-area prose prose-slate dark:prose-invert max-w-none">
          {postDetail?.content_blocks && Array.isArray(postDetail.content_blocks) ? (
            postDetail.content_blocks.map(renderBlock)
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{post.title}</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-base leading-relaxed">
                {post.excerpt || 'Nội dung chi tiết đang được cập nhật...'}
              </p>
            </>
          )}
        </article>
      </div>
      {/* end printRef */}

      {/* ──────── Comments Section ──────── */}
      <section className="max-w-[720px] mx-auto mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 print:hidden">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">chat_bubble</span>
          Bình luận ({comments.length})
        </h2>

        {/* Comment input */}
        <div className="flex gap-4 mb-8">
          <img
            src={user?.avatar || 'https://i.pravatar.cc/100?img=0'}
            alt=""
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              aria-label="Viết bình luận"
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={commentLoading || !commentText.trim()}
                className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {commentLoading ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </div>
        </div>

        {/* Comments list */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((c: any) => (
              <div key={c.id || c._id} className="flex gap-4">
                <img
                  src={c.avatar || 'https://i.pravatar.cc/100?img=0'}
                  alt={c.user_name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{c.user_name}</span>
                    <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{c.content}</p>
                  {c.likes != null && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <span className="material-symbols-outlined text-xs">thumb_up</span>
                      <span>{c.likes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </section>

      {/* ──────── Related Articles ──────── */}
      {relatedPosts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Có thể bạn quan tâm</h2>
            <Link to="/featured-events" className="text-primary font-semibold hover:underline text-sm flex items-center gap-1">
              Xem thêm <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related: any) => (
              <Link key={related.id || related._id} to={`/events/${related.slug || related.id || related._id}`} className="group cursor-pointer">
                <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-200 group-hover:-translate-y-1 transition-transform duration-300 shadow-sm group-hover:shadow-md">
                  <img
                    alt={related.title}
                    className="w-full h-full object-cover"
                    src={related.thumbnail || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400'}
                  />
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {categories.find((c: any) => c.id === related.category || c.id === related.category_id)?.name?.toUpperCase() || related.category?.toUpperCase() || 'SỰ KIỆN'}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white mt-1 group-hover:text-primary transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span>{formatDate(related.published_at || related.start_date)}</span>
                  {related.read_time && <span>{related.read_time} phút đọc</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
        />
      )}
    </main>
  );
};

export default EventDetail;