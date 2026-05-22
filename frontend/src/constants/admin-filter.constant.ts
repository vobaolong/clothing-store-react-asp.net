import { CategoryGender, CategoryProductType } from '@/enums'
import {
  createOrderStatusOptions,
  createPaymentStatusOptions,
  createOptions
} from '@/utils/enum.utils'

export const ADMIN_FILTER_ALL_VALUE = 'all'

export const ADMIN_ORDER_STATUS_FILTER_OPTIONS = [
  { label: 'Trạng thái đơn hàng', value: ADMIN_FILTER_ALL_VALUE },
  ...createOrderStatusOptions()
]

export const ADMIN_PAYMENT_STATUS_FILTER_OPTIONS = [
  { label: 'Trạng thái thanh toán', value: ADMIN_FILTER_ALL_VALUE },
  ...createPaymentStatusOptions()
]

export const ADMIN_COMMON_STATUS_OPTIONS = [
  { label: 'Kích hoạt', value: 'Active' },
  { label: 'Ngưng', value: 'Inactive' },
  { label: 'Lưu trữ', value: 'Archived' }
] as const

export const ADMIN_ACTIVE_FILTER_OPTIONS = [
  { label: 'Tất cả trạng thái', value: ADMIN_FILTER_ALL_VALUE },
  { label: 'Kích hoạt', value: 'true' },
  { label: 'Ngưng', value: 'false' }
]

export const ADMIN_CATEGORY_GENDER_FILTER_OPTIONS = [
  { label: 'Giới tính', value: ADMIN_FILTER_ALL_VALUE },
  ...createOptions(Object.values(CategoryGender))
]

export const ADMIN_CATEGORY_TYPE_FILTER_OPTIONS = [
  { label: 'Loại sản phẩm', value: ADMIN_FILTER_ALL_VALUE },
  ...createOptions(Object.values(CategoryProductType))
]
