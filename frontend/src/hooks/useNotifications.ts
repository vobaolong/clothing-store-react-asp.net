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
  markAllAsRead as markAllAsReadAction
} from '@/state/notification-slice'
import type { RootState } from '@/app/store/store'
import type {
  GetNotificationsRequest,
  NotificationsResponse
} from '@/types/notification'

export const useNotifications = (params: GetNotificationsRequest = {}) => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const notificationState = useSelector(
    (state: RootState) => state.notifications
  )

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

  // Note: unread count is available from the notifications response
  // and other parts of the app can use `useUnreadCount` hook which
  // polls on an interval. Here we avoid running a second unread-count
  // query to reduce duplication.

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
    realtimeNotifications: notificationState.realtimeNotifications,
    unreadCount: notificationsData?.unreadCount ?? notificationState.unreadCount,
    totalCount: notificationsData?.totalCount ?? 0,

    isLoading,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,

    error: error?.message ?? notificationState.error,

    markAsRead,
    markAllAsRead,
    refetch
  }
}

export const useUnreadCount = () => {
  const unreadCount = useSelector(
    (state: RootState) => state.notifications.unreadCount
  )

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
