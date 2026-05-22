export const AdminNavKey = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  CUSTOMERS: 'customers',
  COUPONS: 'coupons',
  BANNERS: 'banners'
} as const

export type AdminNavKey = (typeof AdminNavKey)[keyof typeof AdminNavKey]

export function isAdminNavKey(value: string): value is AdminNavKey {
  return (Object.values(AdminNavKey) as string[]).includes(value)
}

export const FilterStatus = {
  ALL: 'All',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
} as const

export type FilterStatus = (typeof FilterStatus)[keyof typeof FilterStatus]
