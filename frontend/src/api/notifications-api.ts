import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type {
  NotificationsResponse,
  GetNotificationsRequest
} from '@/types/notification.type'

export const getNotifications = async (
  params: GetNotificationsRequest = {}
): Promise<NotificationsResponse> => {
  return apiData(apiClient.get(API_ENDPOINTS.notifications.root, { params }))
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiVoid(apiClient.put(API_ENDPOINTS.notifications.markAsRead(id)))
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiVoid(apiClient.put(API_ENDPOINTS.notifications.markAllAsRead))
}

export const getUnreadCount = async (): Promise<number> => {
  return apiData(apiClient.get(API_ENDPOINTS.notifications.unreadCount))
}
