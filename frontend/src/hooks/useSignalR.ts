import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { getSignalRService } from '@/utils/signalr-service'
import { addRealtimeNotification } from '@/state/notification-slice'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { selectAuthToken } from '@/state/auth'
import type {
  RealtimeNotificationDto,
  OrderUpdateDto
} from '@/types/notification.type'

export const useSignalR = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const token = useSelector(selectAuthToken)
  const isConnectedRef = useRef(false)
  const handlersRegisteredRef = useRef(false)

  // Stable callbacks via ref — identity never changes
  const callbacksRef = useRef({
    onNotification: (notification: RealtimeNotificationDto) => {
      dispatch(addRealtimeNotification(notification))
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications
      })
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notificationsUnreadCount
      })
    },
    onOrderUpdate: (raw: unknown) => {
      const update = raw as OrderUpdateDto
      if (!update?.orderId) return

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myOrderDetail(update.orderId)
      })
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myOrders()
      })
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminOrdersBase
      })
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminOrderDetail(update.orderId)
      })
    }
  })

  useEffect(() => {
    if (!token) {
      if (isConnectedRef.current) {
        getSignalRService().stop()
        isConnectedRef.current = false
      }
      handlersRegisteredRef.current = false
      return
    }

    if (isConnectedRef.current) return

    const service = getSignalRService()

    const tryConnect = async () => {
      if (!handlersRegisteredRef.current) {
        service.offNotification(callbacksRef.current.onNotification)
        service.offOrderUpdate(callbacksRef.current.onOrderUpdate)

        service.onNotification(callbacksRef.current.onNotification)
        service.onOrderUpdate(callbacksRef.current.onOrderUpdate)
        handlersRegisteredRef.current = true
      }

      try {
        await service.start()
        isConnectedRef.current = true
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[SignalR] Failed to start:', error)
        }
      }
    }

    void tryConnect()

    return () => {
      if (isConnectedRef.current) {
        getSignalRService().stop()
        isConnectedRef.current = false
      }
    }
  }, [dispatch, queryClient, token])
}
