import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { getSignalRService } from '@/utils/signalr-service'
import { addRealtimeNotification } from '@/state/notification-slice'
import { QUERY_KEYS } from '@/constants/query-keys'
import { selectAuthToken } from '@/state/auth-slice'
import type {
  RealtimeNotificationDto,
  OrderUpdateDto
} from '@/types/notification'

export const useSignalR = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const token = useSelector(selectAuthToken)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!token) {
      if (isInitializedRef.current) {
        getSignalRService().stop()
        isInitializedRef.current = false
      }
      return
    }

    if (isInitializedRef.current) return

    const tryConnect = async () => {
      const service = getSignalRService()

      service.onNotification((notification: RealtimeNotificationDto) => {
        dispatch(addRealtimeNotification(notification))
      })

      service.onOrderUpdate((raw: unknown) => {
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
      })

      try {
        await service.start()
        isInitializedRef.current = true
      } catch (error) {
        console.error('[SignalR] Failed to start:', error)
      }
    }

    void tryConnect()

    return () => {
      if (isInitializedRef.current) {
        getSignalRService().stop()
        isInitializedRef.current = false
      }
    }
  }, [dispatch, queryClient, token])
}
