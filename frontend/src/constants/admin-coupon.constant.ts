import { createCouponDiscountTypeOptions } from '@/utils/enum.utils'
import {
  ADMIN_COMMON_STATUS_OPTIONS,
  ADMIN_FILTER_ALL_VALUE
} from '@/constants/admin-filter.constant'

export const ADMIN_COUPON_TYPE_FILTER_OPTIONS = [
  { label: 'Loại giảm giá', value: ADMIN_FILTER_ALL_VALUE },
  ...createCouponDiscountTypeOptions()
]

export const ADMIN_COUPON_STATUS_FILTER_OPTIONS = [
  { label: 'Trạng thái mã', value: ADMIN_FILTER_ALL_VALUE },
  ...ADMIN_COMMON_STATUS_OPTIONS
]
