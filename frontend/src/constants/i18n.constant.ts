import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  CouponDiscountType,
  CouponStatus,
  CategoryGender,
  CategoryType
} from '@/enums'
import i18n from 'i18next'

const LABEL_KEY_MAP: Record<string, string> = {
  [OrderStatus.PENDING]: 'order.pending',
  [OrderStatus.CONFIRMED]: 'order.confirmed',
  [OrderStatus.SHIPPING]: 'order.shipping',
  [OrderStatus.DELIVERED]: 'order.delivered',
  [OrderStatus.CANCELLED]: 'order.cancelled',

  [PaymentStatus.UNPAID]: 'payment.unpaid',
  [PaymentStatus.PAID]: 'payment.paid',
  [PaymentStatus.REFUNDED]: 'payment.refunded',

  [PaymentMethod.COD]: 'payment.cod',
  [PaymentMethod.VNPAY]: 'payment.vnPay',

  [CouponDiscountType.PERCENT]: 'coupon.percent',
  [CouponDiscountType.FLAT]: 'coupon.fixed',

  [CouponStatus.ACTIVE]: 'coupon.active',
  [CouponStatus.INACTIVE]: 'coupon.inactive',
  [CouponStatus.ARCHIVED]: 'coupon.archived',

  [CategoryGender.MALE]: 'product.male',
  [CategoryGender.FEMALE]: 'product.female',
  [CategoryGender.UNISEX]: 'product.unisex',

  [CategoryType.CLOTHING]: 'product.clothing',
  [CategoryType.SHOES]: 'product.shoes',
  [CategoryType.ACCESSORIES]: 'product.accessories',

  active: 'common.active',
  locked: 'common.locked',
  all: 'common.all'
}

export const getVietnameseLabel = (key: string): string => {
  const translationKey = LABEL_KEY_MAP[key]
  return translationKey ? String(i18n.t(translationKey as never)) : String(key)
}
