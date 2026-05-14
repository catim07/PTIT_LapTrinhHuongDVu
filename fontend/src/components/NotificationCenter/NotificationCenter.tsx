import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadNotifications, markAsRead, markAllRead, deleteNotification } from '../../slices/notificationSlice';

const ICON_MAP: Record<string, { icon: string; bg: string; color: string }> = {
  order: { icon: 'shopping_bag', bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
  payment: { icon: 'payment', bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' },
  promotion: { icon: 'local_offer', bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400' },
  shipping: { icon: 'local_shipping', bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
  system: { icon: 'settings', bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-600 dark:text-slate-400' },
  warning: { icon: 'warning', bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
  success: { icon: 'check_circle', bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
  coupon: { icon: 'confirmation_number', bg: 'bg-pink-100 dark:bg-pink-900/30', color: 'text-pink-600 dark:text-pink-400' },
  return: { icon: 'assignment_return', bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
  support: { icon: 'support_agent', bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
  info: { icon: 'info', bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600 dark:text-cyan-400' },
};

const getNotifStyle = (type?: string, icon?: string) => {
  if (type && ICON_MAP[type]) return ICON_MAP[type];
  if (icon && ICON_MAP[icon]) return ICON_MAP[icon];
  return ICON_MAP.info;
};

const timeAgo = (dateStr: string, t: any) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('notification.justNow', 'Vừa xong');
  if (mins < 60) return t('notification.minutesAgo', { count: mins, defaultValue: `${mins} phút trước` });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('notification.hoursAgo', { count: hrs, defaultValue: `${hrs} giờ trước` });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t('notification.daysAgo', { count: days, defaultValue: `${days} ngày trước` });
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const parseNotificationText = (rawTitle?: string, rawMessage?: string) => {
  const title = String(rawTitle || '').trim();
  const message = String(rawMessage || '').replace(/\r\n/g, '\n').trim();

  if (title && message) return { title, message };

  if (message.includes('\n')) {
    const [first, ...rest] = message.split('\n').map((part) => part.trim()).filter(Boolean);
    return {
      title: title || first || 'Thông báo',
      message: rest.join(' ') || (title ? message : ''),
    };
  }

  if (message.includes('|')) {
    const parts = message.split('|').map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return {
        title: title || parts[0] || 'Thông báo',
        message: parts.slice(1).join(' • '),
      };
    }
  }

  const colonMatch = message.match(/^([^:]{3,}):\s*(.+)$/);
  if (!title && colonMatch) {
    return {
      title: colonMatch[1].trim() || 'Thông báo',
      message: colonMatch[2].trim(),
    };
  }

  return {
    title: title || 'Thông báo',
    message,
  };
};

const NotificationCenter: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: notifications, status } = useAppSelector(state => state.notification);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (user && status === 'idle') {
      dispatch(loadNotifications());
    }
  }, [dispatch, user, status]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            {t('notification.title', 'Thông báo của bạn')}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount} {t('notification.new', 'mới')}
              </span>
            )}
          </h2>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => dispatch(markAllRead())}
            className="text-primary text-sm font-bold hover:underline"
          >
            {t('notification.markAllRead', 'Đánh dấu đã đọc tất cả')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">notifications_off</span>
            <p className="text-slate-500 font-medium">{t('notification.empty', 'Chưa có thông báo nào.')}</p>
          </div>
        ) : (
          notifications.map(notif => {
            const resolvedType = (notif as any).type || (notif as any).metadata?.type || 'info';
            const resolvedIcon = (notif as any).icon || (notif as any).metadata?.icon;
            const style = getNotifStyle(resolvedType, resolvedIcon);
            const parsed = parseNotificationText(notif.title, notif.message);
            
            return (
              <div 
                key={notif.id} 
                className={`p-4 rounded-xl transition-all ${notif.is_read ? 'bg-slate-50 dark:bg-slate-800/50 opacity-75' : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'}`}
              >
                <div className="flex gap-3">
                  {/* Type Icon */}
                  <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-xl ${style.color}`}>
                      {resolvedIcon || style.icon}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm leading-snug ${notif.is_read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                          {parsed.title}
                        </h4>
                        <p className="text-sm mt-1 text-slate-600 dark:text-slate-400 line-clamp-2">{parsed.message}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-slate-400">{timeAgo(notif.created_at, t)}</p>
                          {(notif.action_url || (notif as any).link) && (
                            <a
                              href={notif.action_url || (notif as any).link}
                              className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                            >
                              {t('notification.viewDetail', 'Xem chi tiết')}
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {!notif.is_read && (
                          <button 
                            onClick={() => dispatch(markAsRead({ notificationId: notif.id }))}
                            className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                            aria-label={t('notification.markRead', 'Đánh dấu đã đọc')}
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                        )}
                        <button 
                          onClick={() => dispatch(deleteNotification({ notificationId: notif.id }))}
                          className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          aria-label={t('notification.delete', 'Xóa thông báo')}
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
