import { CouponDiscountType, CouponStatus } from '@/enums'

export const COUPON_STATUS_OPTIONS: Array<{
  label: string
  value: CouponStatus
}> = [
  { label: 'Kích hoạt', value: CouponStatus.ACTIVE },
  { label: 'Ngưng', value: CouponStatus.INACTIVE },
  { label: 'Lưu trữ', value: CouponStatus.ARCHIVED }
]

export const COUPON_DISCOUNT_TYPE_OPTIONS: Array<{
  label: string
  value: CouponDiscountType
}> = [
  { label: 'Số tiền cố định', value: CouponDiscountType.FLAT },
  { label: 'Phần trăm', value: CouponDiscountType.PERCENT }
]