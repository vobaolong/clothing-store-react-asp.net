import { useCallback, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import {
  deleteAdminProduct,
  getAdminDeletedProducts,
  getAdminProducts,
  restoreAdminProduct,
  updateAdminProductActive
} from '@/api/admin-api'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/features/admin/context/AdminContext'
import ProductDrawer from '@/components/admin/ProductDrawer'
import AdminProductsSelectionActions from '@/components/admin/AdminProductsSelectionActions'
import AdminProductsTable from '@/components/admin/AdminProductsTable'
import AdminProductImportModal from '@/components/admin/AdminProductImportModal'
import AdminProductsToolbar from '@/components/admin/AdminProductsToolbar'
import { buildAdminProductView } from '@/components/admin/admin-products-utils'
import type { AdminProduct, ProductView } from '@/types'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'

export type AdminProductListMode = 'active' | 'deleted'

export default function AdminProductsSection() {
  const {
    filters: adminFilters,
    refresh,
    confirmDelete,
    modals,
    editing,
    editor
  } = useAdmin()
  const { productListMode: listMode, setProductListMode } = adminFilters
  const { clearDirty } = editor

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.adminProducts,
    queryFn: getAdminProducts,
    enabled: listMode === 'active'
  })

  const deletedProductsQuery = useQuery({
    queryKey: QUERY_KEYS.adminProductsDeleted,
    queryFn: getAdminDeletedProducts,
    enabled: listMode === 'deleted'
  })

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.adminCategories,
    queryFn: () => import('@/api/admin-api').then((m) => m.getAdminCategories())
  })

  const data =
    listMode === 'active' ? productsQuery.data : deletedProductsQuery.data
  const loading =
    listMode === 'active'
      ? productsQuery.isLoading
      : deletedProductsQuery.isLoading
  const categories = categoriesQuery.data
  const refreshQuery =
    listMode === 'active' ? productsQuery : deletedProductsQuery

  const onCreate = useCallback(() => {
    editing.setProduct(null)
    clearDirty('product')
    modals.setProduct(true)
  }, [clearDirty, editing, modals])

  const onEdit = useCallback(
    (product: AdminProduct) => {
      editing.setProduct(product)
      clearDirty('product')
      modals.setProduct(true)
    },
    [clearDirty, editing, modals]
  )

  const onDelete = useCallback(
    (product: AdminProduct) =>
      confirmDelete('Bạn có chắc chắn muốn xóa sản phẩm này?', async () => {
        await deleteAdminProduct(product.id)
        toast.success('Sản phẩm đã được xóa')
        await refresh()
      }),
    [confirmDelete, refresh]
  )

  const onToggleActive = useCallback(
    async (product: AdminProduct, isActive: boolean) => {
      await updateAdminProductActive(product.id, { isActive })
      toast.success(
        isActive ? 'Sản phẩm đã được kích hoạt' : 'Sản phẩm đã được vô hiệu hóa'
      )
      await refresh()
    },
    [refresh]
  )

  const onRestore = useCallback(
    async (product: AdminProduct) => {
      await restoreAdminProduct(product.id)
      toast.success('Sản phẩm đã được khôi phục')
      await refresh()
    },
    [refresh]
  )

  const [selectionState, setSelectionState] = useState({
    selectedRowKeys: [] as React.Key[],
    viewProduct: null as ProductView | null
  })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    categoryId: ADMIN_FILTER_ALL_VALUE,
    active: ADMIN_FILTER_ALL_VALUE,
    dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
  })

  const openProductView = useCallback(
    (product: AdminProduct, updatedAt?: string | null) => {
      setSelectionState((current) => ({
        ...current,
        viewProduct: buildAdminProductView(product, updatedAt)
      }))
    },
    []
  )

  const categoryTreeData = useMemo(
    () => buildCategoryTreeSelectData(categories ?? []),
    [categories]
  )

  const filteredData = useMemo(() => {
    const list = data ?? []
    const needle = adminSearchNeedle(filters.search)
    const startOfDay = filters.dateRange?.[0]?.startOf('day')
    const endOfDay = filters.dateRange?.[1]?.endOf('day')

    return list.filter((product) => {
      const searchMatch =
        !needle ||
        adminRowMatches(
          needle,
          product.name,
          product.productCode,
          product.slug,
          product.categoryName,
          product.id,
          product.categoryId
        )
      const categoryMatch =
        filters.categoryId === ADMIN_FILTER_ALL_VALUE ||
        product.categoryId === filters.categoryId
      const activeMatch =
        filters.active === ADMIN_FILTER_ALL_VALUE
          ? true
          : filters.active === 'active'
            ? product.isActive
            : !product.isActive

      const createdAt = dayjs(product.createdAt)
      const dateMatch =
        (!startOfDay ||
          createdAt.isAfter(startOfDay) ||
          createdAt.isSame(startOfDay)) &&
        (!endOfDay || createdAt.isBefore(endOfDay) || createdAt.isSame(endOfDay))

      return searchMatch && categoryMatch && activeMatch && dateMatch
    })
  }, [data, filters])

  const rowSelection = {
    selectedRowKeys: selectionState.selectedRowKeys,
    onChange: (keys: React.Key[]) =>
      setSelectionState((current) => ({
        ...current,
        selectedRowKeys: keys
      }))
  }

  const clearSelection = useCallback(
    () => setSelectionState((current) => ({ ...current, selectedRowKeys: [] })),
    []
  )

  const isTrash = listMode === 'deleted'
  const hasSelection = selectionState.selectedRowKeys.length > 0

  return (
    <div className='space-y-3!'>
      <AdminProductsToolbar
        listMode={listMode}
        onListModeChange={setProductListMode}
        refreshQuery={refreshQuery}
        onImportExcel={() => setIsImportModalOpen(true)}
        onCreate={onCreate}
        selectedActions={
          hasSelection ? (
            <AdminProductsSelectionActions
              isTrash={isTrash}
              selectedRowKeys={selectionState.selectedRowKeys}
              onClearSelection={clearSelection}
              onRefresh={refresh}
            />
          ) : null
        }
        searchValue={filters.search}
        onSearchChange={(value) =>
          setFilters((current) => ({ ...current, search: value }))
        }
        categoryId={filters.categoryId}
        categoryTreeData={categoryTreeData}
        onCategoryChange={(value) =>
          setFilters((current) => ({
            ...current,
            categoryId: value ?? ADMIN_FILTER_ALL_VALUE
          }))
        }
        activeValue={filters.active}
        onActiveChange={(value) =>
          setFilters((current) => ({ ...current, active: value }))
        }
        dateRange={filters.dateRange}
        onDateRangeChange={(dates) =>
          setFilters((current) => ({
            ...current,
            dateRange: dates ? [dates[0], dates[1]] : [null, null]
          }))
        }
      />
      <AdminProductsTable
        dataSource={filteredData}
        loading={loading}
        isTrash={isTrash}
        rowSelection={rowSelection}
        onView={openProductView}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        onToggleActive={onToggleActive}
        onRefresh={refresh}
      />
      <ProductDrawer
        open={Boolean(selectionState.viewProduct)}
        product={selectionState.viewProduct}
        onClose={() =>
          setSelectionState((current) => ({ ...current, viewProduct: null }))
        }
      />
      <AdminProductImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={refresh}
      />
    </div>
  )
}