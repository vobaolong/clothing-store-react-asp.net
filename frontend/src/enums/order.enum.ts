export const OrderStatus = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
