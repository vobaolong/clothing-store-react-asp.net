import type { CouponDiscountType, CouponStatus } from '@/enums'

export type Coupon = {
  id: string
  code: string
  discountType: CouponDiscountType
  discountAmount: number
  minOrderSubtotal: number
  maxUsage: number
  usedCount: number
  startsAt?: string | null
  expiresAt: string
  status: CouponStatus
  createdAt: string
}

export type AvailableCoupon = Pick<
  Coupon,
  | 'id'
  | 'code'
  | 'discountType'
  | 'discountAmount'
  | 'minOrderSubtotal'
  | 'startsAt'
  | 'expiresAt'
  | 'maxUsage'
  | 'usedCount'
>

export type CouponUpsertPayload = {
  code: string
  discountType: CouponDiscountType
  discountAmount: number
  minOrderSubtotal: number
  maxUsage: number
  startsAt?: string | null
  expiresAt: string
  status: CouponStatus
}
