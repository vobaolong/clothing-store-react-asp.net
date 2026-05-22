import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { notification as antdNotification } from 'antd'
import { getSignalRService } from '@/services/signalr-service'
import { QUERY_KEYS } from '@/constants/query-keys'
import { NotificationType } from '@/types/notification'
import type {
  RealtimeNotificationDto,
  OrderUpdateDto
} from '@/types/notification'

const STATUS_ICON: Record<string, string> = {
  OrderConfirmed: '✅',
  OrderShipping: '🚚',
  OrderDelivered: '📦',
  OrderCancelled: '❌',
  OrderCreated: '🛍️',
  PaymentReceived: '💳'
}

export const useOrderRealtime = (orderId: string | undefined) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!orderId) return

    const service = getSignalRService()

    const handleOrderUpdate = (raw: unknown) => {
      const update = raw as OrderUpdateDto
      if (update?.orderId !== orderId) return

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myOrderDetail(orderId)
      })
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myOrders()
      })
    }

    const handleNotification = (n: RealtimeNotificationDto) => {
      if (n.relatedEntityId !== orderId) return

      const icon = STATUS_ICON[n.type] ?? '🔔'
      const isError = n.type === NotificationType.OrderCancelled

      antdNotification[isError ? 'error' : 'success']({
        title: `${icon} ${n.title}`,
        description: n.message,
        placement: 'topRight',
        duration: 6
      })
    }

    service.onOrderUpdate(handleOrderUpdate)
    service.onNotification(handleNotification)

    return () => {
      service.offOrderUpdate(handleOrderUpdate)
      service.offNotification(handleNotification)
    }
  }, [orderId, queryClient])
}
