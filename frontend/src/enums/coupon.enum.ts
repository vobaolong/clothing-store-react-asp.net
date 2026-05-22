export const CouponDiscountType = {
  FLAT: 'Flat',
  PERCENT: 'Percent'
} as const

export type CouponDiscountType =
  (typeof CouponDiscountType)[keyof typeof CouponDiscountType]

export const CouponStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archived'
} as const

export type CouponStatus = (typeof CouponStatus)[keyof typeof CouponStatus]
