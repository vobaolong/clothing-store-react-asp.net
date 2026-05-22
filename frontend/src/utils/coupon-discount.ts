import { CouponDiscountType } from '@/enums'
import { formatCurrency } from '@/utils/format'

type CouponDiscountLike = {
  discountType: string
  discountAmount: number
}

export const formatCouponDiscount = (coupon: CouponDiscountLike) =>
  coupon.discountType === CouponDiscountType.PERCENT
    ? `${coupon.discountAmount}%`
    : formatCurrency(coupon.discountAmount)

export const calculateCouponDiscountAmount = (
  coupon: CouponDiscountLike,
  subtotal: number,
) => {
  const rawAmount =
    coupon.discountType === CouponDiscountType.PERCENT
      ? (subtotal * coupon.discountAmount) / 100
      : coupon.discountAmount

  return Math.max(0, Math.round(rawAmount))
}
