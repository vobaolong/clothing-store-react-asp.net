import { lazy, Suspense } from 'react'
import { AdminNavKey } from '@/enums'

const AdminBannersSection = lazy(() => import('@/components/admin/AdminBannersSection'))
const AdminCategoriesSection = lazy(() => import('@/components/admin/AdminCategoriesSection'))
const AdminCouponsSection = lazy(() => import('@/components/admin/AdminCouponsSection'))
const AdminCustomersSection = lazy(() => import('@/components/admin/AdminCustomersSection'))
const AdminDashboardSection = lazy(() => import('@/components/admin/AdminDashboardSection'))
const AdminOrdersSection = lazy(() => import('@/components/admin/AdminOrdersSection'))
const AdminProductsSection = lazy(() => import('@/components/admin/AdminProductsSection'))
const AdminReviewsSection = lazy(() => import('@/components/admin/AdminReviewsSection'))

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
