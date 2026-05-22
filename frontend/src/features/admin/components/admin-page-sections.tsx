import { lazy, Suspense } from 'react'
import { AdminNavKey } from '@/enums'

const AdminBannersSection = lazy(() => import('@/features/admin/sections/admin-banners-section'))
const AdminCategoriesSection = lazy(() => import('@/features/admin/sections/admin-categories-section'))
const AdminCouponsSection = lazy(() => import('@/features/admin/sections/admin-coupons-section'))
const AdminCustomersSection = lazy(() => import('@/features/admin/sections/admin-customers-section'))
const AdminDashboardSection = lazy(() => import('@/features/admin/sections/admin-dashboard-section'))
const AdminOrdersSection = lazy(() => import('@/features/admin/sections/admin-orders-section'))
const AdminProductsSection = lazy(() => import('@/features/admin/sections/admin-products-section'))
const AdminReviewsSection = lazy(() => import('@/features/admin/sections/admin-reviews-section'))

type AdminPageSectionsProps = {
  activeNav: AdminNavKey
}

export default function AdminPageSections({
  activeNav
}: AdminPageSectionsProps) {
  return (
    <Suspense fallback={null}>
      {activeNav === AdminNavKey.DASHBOARD && <AdminDashboardSection />}
      {activeNav === AdminNavKey.PRODUCTS && <AdminProductsSection />}
      {activeNav === AdminNavKey.CATEGORIES && <AdminCategoriesSection />}
      {activeNav === AdminNavKey.ORDERS && <AdminOrdersSection />}
      {activeNav === AdminNavKey.REVIEWS && <AdminReviewsSection />}
      {activeNav === AdminNavKey.CUSTOMERS && <AdminCustomersSection />}
      {activeNav === AdminNavKey.COUPONS && <AdminCouponsSection />}
      {activeNav === AdminNavKey.BANNERS && <AdminBannersSection />}
    </Suspense>
  )
}
