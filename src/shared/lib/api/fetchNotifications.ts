import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type NotificationsResponse = operations['getList_4']['responses'][200]['content']['application/json'];
export type NotificationResponse = operations['markAsRead']['responses'][200]['content']['application/json'];

class FetchNotifications {
  getNotifications = () => apiRequest<NotificationsResponse>('/api/v1/notifications');

  patchNotificationRead = (notificationId: number) =>
    apiRequest<NotificationResponse>(`/api/v1/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
}

const fetchNotifications = new FetchNotifications();
export { fetchNotifications };
