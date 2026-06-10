import { NotificationType } from '@/types/notification.type'

export const NOTIFICATION_ICONS: Record<string, string> = {
  [NotificationType.OrderCreated]: '🛍️',
  [NotificationType.OrderConfirmed]: '✅',
  [NotificationType.OrderShipping]: '🚚',
  [NotificationType.OrderDelivered]: '📦',
  [NotificationType.OrderCancelled]: '❌',
  [NotificationType.PaymentReceived]: '💳',
  [NotificationType.Promotion]: '🎉'
}

export const getNotificationIcon = (type: string): string =>
  NOTIFICATION_ICONS[type] ?? '🔔'

export type NotificationLevel = 'success' | 'info' | 'warning' | 'error'

export const getNotificationLevel = (type: string): NotificationLevel => {
  switch (type) {
    case NotificationType.OrderCancelled:
      return 'error'
    case NotificationType.OrderDelivered:
      return 'success'
    default:
      return 'info'
  }
}
