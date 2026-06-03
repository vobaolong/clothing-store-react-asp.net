import { OrderStatus } from '@/enums'
import {
  ORDER_FILTER_ALL_LABEL,
  ORDER_FILTER_ALL_VALUE
} from '@/constants/order.constant'

export const ORDER_FILTER_STATUSES = [
  ORDER_FILTER_ALL_VALUE,
  ...Object.values(OrderStatus)
] as const

export { ORDER_FILTER_ALL_LABEL, ORDER_FILTER_ALL_VALUE }