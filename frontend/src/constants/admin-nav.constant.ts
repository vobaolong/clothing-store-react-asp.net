import { AdminNavKey } from '@/enums'

export const ADMIN_PAGE_HEADER_TITLE_KEYS = {
  [AdminNavKey.DASHBOARD]: 'admin.dashboard',
  [AdminNavKey.PRODUCTS]: 'admin.products',
  [AdminNavKey.CATEGORIES]: 'admin.categories',
  [AdminNavKey.ORDERS]: 'admin.orders',
  [AdminNavKey.REVIEWS]: 'admin.reviews',
  [AdminNavKey.CUSTOMERS]: 'admin.customers',
  [AdminNavKey.COUPONS]: 'admin.coupons',
  [AdminNavKey.BANNERS]: 'admin.banners'
} as const

export const ADMIN_PAGE_BRAND_TITLE_KEY = 'admin.brandTitle' as const
