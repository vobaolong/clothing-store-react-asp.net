export const HOME_TAB_LABELS = {
  ALL: 'Tất cả',
  NEW: 'Sản phẩm mới',
  SALE: 'Giảm giá'
} as const

export const HOME_TABS = [
  HOME_TAB_LABELS.ALL,
  HOME_TAB_LABELS.NEW,
  HOME_TAB_LABELS.SALE
] as const

export type HomeTabLabel = (typeof HOME_TABS)[number]

export const FILTER_STATUS_LABELS = {
  ALL: 'Tất cả',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Không hoạt động'
} as const

export const ORDER_STATUS_LABELS = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Shipping: 'Đang giao hàng',
  Delivered: 'Đã giao hàng',
  Cancelled: 'Đã huỷ'
} as const

export const getOrderStatusLabel = (status: string) =>
  (ORDER_STATUS_LABELS as Record<string, string | undefined>)[status] ?? status

export const ADMIN_NAV_LABELS = {
  DASHBOARD: 'Tổng quan',
  PRODUCTS: 'Sản phẩm',
  CATEGORIES: 'Danh mục',
  ORDERS: 'Đơn hàng',
  REVIEWS: 'Đánh giá',
  CUSTOMERS: 'Khách hàng',
  COUPONS: 'Vouchers',
  BANNERS: 'Banner'
} as const

export const STATUS_COLORS: Record<string, string> = {
  Pending: 'gold',
  Confirmed: 'blue',
  Shipping: 'cyan',
  Delivered: 'green',
  Cancelled: 'red',
	Paid:'green',
	Unpaid:'red'
}
