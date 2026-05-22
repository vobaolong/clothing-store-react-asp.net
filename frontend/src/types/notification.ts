export const NotificationType = {
  OrderCreated: 'OrderCreated',
  OrderConfirmed: 'OrderConfirmed',
  OrderShipping: 'OrderShipping',
  OrderDelivered: 'OrderDelivered',
  OrderCancelled: 'OrderCancelled',
  PaymentReceived: 'PaymentReceived',
  System: 'System',
  Promotion: 'Promotion'
} as const

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType]

export interface RealtimeNotificationDto {
  title: string
  message: string
  type: NotificationType
  data?: unknown
  relatedEntityId?: string
  relatedEntityType?: string
}

export interface NotificationDto {
  id: string
  title: string
  message: string
  type: NotificationType
  data?: unknown
  isRead: boolean
  createdAt: string
  readAt?: string
  relatedEntityId?: string
  relatedEntityType?: string
}

export interface NotificationsResponse {
  notifications: NotificationDto[]
  totalCount: number
  unreadCount: number
}

export interface NotificationState {
  notifications: NotificationDto[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  realtimeNotifications: RealtimeNotificationDto[]
}

export interface GetNotificationsRequest {
  page?: number
  pageSize?: number
  isRead?: boolean
}

/** Mirrors backend OrderUpdateDto — used for cache invalidation */
export interface OrderUpdateDto {
  orderId: string
  newStatus: string
  userId?: string
}
