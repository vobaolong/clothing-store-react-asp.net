import { lazy, Suspense } from 'react'

import { useQuery } from '@tanstack/react-query'
import { getAdminCategories, getAdminProducts } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { useAdmin } from '@/context/AdminContext'

const AdminOrderDetailModal = lazy(
  () => import('@/components/admin/admin-modal/AdminOrderDetailModal')
)
const BannerModal = lazy(
  () => import('@/components/admin/admin-modal/BannerModal')
)
const CategoryModal = lazy(
  () => import('@/components/admin/admin-modal/CategoryModal')
)
const CouponModal = lazy(
  () => import('@/components/admin/admin-modal/CouponModal')
)
const ProductModal = lazy(
  () => import('@/components/admin/admin-modal/ProductModal')
)

export default function AdminPageModals() {
  const { modals, editing, editor, onSaved } = useAdmin()

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.adminCategories,
    queryFn: getAdminCategories
  })

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.adminProducts,
    queryFn: getAdminProducts
  })

  const categories = categoriesQuery.data
  const products = productsQuery.data

  return (
    <Suspense fallback={null}>
      <AdminOrderDetailModal
        open={Boolean(modals.orderDetailId)}
        orderId={modals.orderDetailId}
        onClose={() => modals.setOrderDetailId(null)}
      />

      <ProductModal
        open={modals.product}
        editing={editing.product}
        categories={categories ?? []}
        onDirty={() => editor.markDirty('product')}
        onClose={() =>
          editor.requestClose('product', () => modals.setProduct(false))
        }
        onSaved={onSaved.product}
      />

      <CategoryModal
        open={modals.category}
        editing={editing.category}
        onDirty={() => editor.markDirty('category')}
        onClose={() =>
          editor.requestClose('category', () => modals.setCategory(false))
        }
        onSaved={onSaved.category}
      />

      <CouponModal
        open={modals.coupon}
        editing={editing.coupon}
        onDirty={() => editor.markDirty('coupon')}
        onClose={() =>
          editor.requestClose('coupon', () => modals.setCoupon(false))
        }
        onSaved={onSaved.coupon}
      />

      <BannerModal
        open={modals.banner}
        editing={editing.banner}
        categories={categories ?? []}
        products={products ?? []}
        onDirty={() => editor.markDirty('banner')}
        onClose={() =>
          editor.requestClose('banner', () => modals.setBanner(false))
        }
        onSaved={onSaved.banner}
      />
    </Suspense>
  )
}
