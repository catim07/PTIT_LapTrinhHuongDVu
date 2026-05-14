import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { eventService } from '../services/eventService';

const FeaturedEvents: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        console.log('Fetching featured events...');
        const data = await eventService.getFeaturedEvents();
        console.log('API response:', data);
        setEvents(data);
      } catch (err: any) {
        console.error('API Error:', err);
        setError(err.message || t('featuredEvents.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const formatPeriod = (start?: string, end?: string) => {
    if (!start && !end) return '';
    const s = start ? new Date(start).toLocaleDateString('vi-VN') : '';
    const e = end ? new Date(end).toLocaleDateString('vi-VN') : '';
    if (s && e) return `${s} - ${e}`;
    if (s) return `${s} — ${t('event.ongoing') || 'Đang diễn ra'}`;
    return e;
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        {t('featuredEvents.loading')}
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('featuredEvents.errorLoad')}</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:opacity-90">
          {t('featuredEvents.retry')}
        </button>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="text-center py-20 max-w-7xl mx-auto px-4">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">event_busy</span>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{t('featuredEvents.noEvents')}</h3>
        <p className="text-slate-500 dark:text-slate-400">
          {t('featuredEvents.noEventsDesc')}
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
        {t('featuredEvents.title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((post: any) => (
          <Link
            key={post._id || post.id}
            to={`/events/${post.slug || post._id || post.id}`}
            className="event-card bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col cursor-pointer group hover:shadow-md transition-all"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                alt={post.thumbnail_alt || post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={post.thumbnail || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400'}
              />
              {post.is_featured && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-400 text-slate-900 text-[10px] font-bold rounded flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {t('featuredEvents.featuredBadge')}
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow space-y-2">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                {post.excerpt}
              </p>
              <div className="pt-4 mt-auto flex flex-wrap items-center gap-3 text-slate-400 dark:text-slate-500 text-xs font-medium">
                {post.author_name && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">person</span>
                    {post.author_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {formatPeriod(post.start_date, post.end_date) || formatDate(post.published_at)}
                </span>
                {(post.views != null && post.views > 0) && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">visibility</span>
                    {post.views.toLocaleString()}
                  </span>
                )}
                {(post.likes != null && post.likes > 0) && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    {post.likes.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedEvents;