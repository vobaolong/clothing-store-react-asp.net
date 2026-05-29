import { lazy, Suspense } from 'react'
import { AdminNavKey } from '@/enums'

const AdminBannersSection = lazy(() => import('./AdminBannersSection'))
const AdminCategoriesSection = lazy(() => import('./AdminCategoriesSection'))
const AdminCouponsSection = lazy(() => import('./AdminCouponsSection'))
const AdminCustomersSection = lazy(() => import('./AdminCustomersSection'))
const AdminDashboardSection = lazy(() => import('./AdminDashboardSection'))
const AdminOrdersSection = lazy(() => import('./AdminOrdersSection'))
const AdminProductsSection = lazy(() => import('./AdminProductsSection'))
const AdminReviewsSection = lazy(() => import('./AdminReviewsSection'))

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
