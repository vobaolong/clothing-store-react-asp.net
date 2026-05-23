import { apiClient } from '@/api/api-client'
import type {
  NotificationsResponse,
  GetNotificationsRequest
} from '@/types/notification'
import type { ApiResponse } from '@/types/common'

const NOTIFICATIONS_BASE_URL = '/notifications'

export const getNotifications = async (
  params: GetNotificationsRequest = {}
): Promise<NotificationsResponse> => {
  const { data } = await apiClient.get<ApiResponse<NotificationsResponse>>(
    NOTIFICATIONS_BASE_URL,
    { params }
  )
  return data.data
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiClient.put(`${NOTIFICATIONS_BASE_URL}/${id}/read`)
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.put(`${NOTIFICATIONS_BASE_URL}/read-all`)
}

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get<ApiResponse<number>>(
    `${NOTIFICATIONS_BASE_URL}/unread-count`
  )
  return data.data
}
