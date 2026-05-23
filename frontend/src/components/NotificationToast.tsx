import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { notification as antdNotification } from 'antd'
import {
  clearRealtimeNotifications,
  selectRealtimeNotifications
} from '@/state/notification-slice'
import { NotificationType } from '@/types/notification'
import type { RealtimeNotificationDto } from '@/types/notification'
import { isAdmin } from '@/state/auth-session'

const getIcon = (type: RealtimeNotificationDto['type']): string => {
  switch (type) {
    case NotificationType.OrderCreated:
      return '🛍️'
    case NotificationType.OrderConfirmed:
      return '✅'
    case NotificationType.OrderShipping:
      return '🚚'
    case NotificationType.OrderDelivered:
      return '📦'
    case NotificationType.OrderCancelled:
      return '❌'
    case NotificationType.PaymentReceived:
      return '💳'
    case NotificationType.Promotion:
      return '🎉'
    default:
      return '🔔'
  }
}

type AntdLevel = 'success' | 'info' | 'warning' | 'error'

const getLevel = (type: RealtimeNotificationDto['type']): AntdLevel => {
  switch (type) {
    case NotificationType.OrderCancelled:
      return 'error'
    case NotificationType.OrderDelivered:
      return 'success'
    case NotificationType.OrderConfirmed:
    case NotificationType.OrderShipping:
      return 'info'
    default:
      return 'info'
  }
}

export const NotificationToastManager = () => {
  const dispatch = useDispatch()
  const queue = useSelector(selectRealtimeNotifications)

  useEffect(() => {
    if (isAdmin()) {
      if (queue.length > 0) {
        dispatch(clearRealtimeNotifications())
      }
      return
    }

    if (queue.length === 0) return

    const snapshot = [...queue]
    dispatch(clearRealtimeNotifications())

    snapshot.forEach((n: RealtimeNotificationDto) => {
      const icon = getIcon(n.type)
      const level = getLevel(n.type)

      antdNotification[level]({
        message: `${icon} ${n.title}`,
        description:
          n.relatedEntityType === 'Order' && n.relatedEntityId ? (
            <span>
              {n.message}{' '}
              <a
                href={`/orders/${n.relatedEntityId}`}
                className='font-medium underline'
              >
                Xem đơn hàng →
              </a>
            </span>
          ) : (
            n.message
          ),
        placement: 'topRight',
        duration: 6
      })
    })
  }, [queue, dispatch])

  return null
}

export default NotificationToastManager
