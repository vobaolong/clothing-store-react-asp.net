export const OrderStatus = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const ORDER_STATUSES = Object.values(OrderStatus) as OrderStatus[]
export const ORDER_FILTER_STATUSES = ['All', ...ORDER_STATUSES] as const
