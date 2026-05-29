import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector, useDispatch } from 'react-redux'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from '@/api/notifications-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
  markNotificationAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  selectNotificationError,
  selectNotificationUnreadCount,
  selectRealtimeNotifications
} from '@/state/notification-slice'
import type {
  GetNotificationsRequest,
  NotificationsResponse
} from '@/types/notification.type'

export const useNotifications = (params: GetNotificationsRequest = {}) => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const realtimeNotifications = useSelector(selectRealtimeNotifications)
  const fallbackUnreadCount = useSelector(selectNotificationUnreadCount)
  const notificationError = useSelector(selectNotificationError)

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery<NotificationsResponse>({
    queryKey: QUERY_KEYS.notificationsList(params),
    queryFn: () => getNotifications(params),
    staleTime: 30_000,
    refetchOnWindowFocus: false
  })

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_data, notificationId) => {
      dispatch(markAsReadAction(notificationId))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      dispatch(markAllAsReadAction())
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
    }
  })
  const markAsRead = (id: string) => markAsReadMutation.mutate(id)
  const markAllAsRead = () => markAllAsReadMutation.mutate()

  return {
    notifications: notificationsData?.notifications ?? [],
    realtimeNotifications,
    unreadCount: notificationsData?.unreadCount ?? fallbackUnreadCount,
    totalCount: notificationsData?.totalCount ?? 0,

    isLoading,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,

    error: error?.message ?? notificationError,

    markAsRead,
    markAllAsRead,
    refetch
  }
}

export const useUnreadCount = () => {
  const unreadCount = useSelector(selectNotificationUnreadCount)

  const { data, isLoading, error } = useQuery<number>({
    queryKey: QUERY_KEYS.notificationsUnreadCount,
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000
  })

  return {
    unreadCount: data ?? unreadCount,
    isLoading,
    error
  }
}
