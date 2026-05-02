import { dataService } from './dataService';

export const notificationService = {
  list: () => dataService.getNotifications(),
  markRead: (id: string | number) => dataService.markNotificationRead(id),
  markAllRead: () => dataService.markAllNotificationsRead(),
  remove: (id: string | number) => dataService.deleteNotification(id),
  broadcast: (payload: { title: string; message?: string; type?: string; icon?: string; link?: string; metadata?: Record<string, any> }) => dataService.broadcastNotification(payload),
};
