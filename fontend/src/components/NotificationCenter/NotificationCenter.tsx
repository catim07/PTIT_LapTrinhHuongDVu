import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadNotifications, markAsRead, markAllRead, deleteNotification } from '../../slices/notificationSlice';

const NotificationCenter: React.FC = () => {
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
            Thông báo của bạn
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} mới</span>
            )}
          </h2>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => dispatch(markAllRead())}
            className="text-primary text-sm font-bold hover:underline"
          >
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Chưa có thông báo nào.</div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-xl border-l-[3px] transition-colors ${notif.is_read ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-75' : 'bg-primary/5 dark:bg-primary/10 border-primary'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className={`text-sm ${notif.is_read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{notif.message}</p>
                  {(notif.action_url || (notif as any).link) && (
                    <a
                      href={notif.action_url || (notif as any).link}
                      className="inline-block text-xs text-primary font-semibold mt-2 hover:underline"
                    >
                      Xem chi tiết
                    </a>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{new Date(notif.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {!notif.is_read && (
                    <button 
                      onClick={() => dispatch(markAsRead({ notificationId: notif.id }))}
                      className="size-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                      aria-label="Đánh dấu đã đọc"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                  )}
                  <button 
                    onClick={() => dispatch(deleteNotification({ notificationId: notif.id }))}
                    className="size-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Xóa thông báo"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
