import { useCallback, useMemo, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AdminCategory } from '@/types'
import { useTableSelection } from '@/hooks/useTableSelection'
import { getAdminCategories, updateAdminCategory } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/context/admin/AdminContext'
import AdminCategoriesToolbar from '@/components/admin/admin-toolbar/AdminCategoriesToolbar'

import type { AdminCategoryFilters } from '@/components/admin/admin-toolbar/AdminCategoriesToolbar'
import { useFilteredCategories } from '@/hooks/useFilteredCategories'
import { useCategoryTreeData } from '@/hooks/useCategoryTreeData'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import AdminCategoriesTable from '@/components/admin/admin-table/AdminCategoriesTable'

const initialFilters: AdminCategoryFilters = {
  search: '',
  parent: ADMIN_FILTER_ALL_VALUE,
  gender: ADMIN_FILTER_ALL_VALUE,
  type: ADMIN_FILTER_ALL_VALUE,
  active: ADMIN_FILTER_ALL_VALUE
}

export default function AdminCategoriesSection() {
  const { refresh, confirmDelete, modals, editing, editor } = useAdmin()
  const { clearDirty } = editor

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.adminCategories,
    queryFn: getAdminCategories
  })
  const data = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])

  const [filters, setFilters] = useState<AdminCategoryFilters>(initialFilters)
  const { rowSelection, clearSelection, selectedIds, hasSelection } =
    useTableSelection<AdminCategory>()

  const filteredData = useFilteredCategories({ data, filters })
  const { parentFilterTreeData, getQuickUpdateParentTreeData } =
    useCategoryTreeData(data)

  const { mutateAsync: deleteCategoryAsync } = useMutation({
    mutationFn: async (id: string) => {
      const { deleteAdminCategory } = await import('@/api/admin-api')
      return deleteAdminCategory(id)
    },
    onSuccess: async () => {
      toast.success('Danh mục đã được xóa')
      await refresh()
      categoriesQuery.refetch()
    },
    onError: () => toast.error('Xóa danh mục thất bại')
  })

  const { mutateAsync: updateCategoryAsync } = useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string
      payload: Parameters<typeof updateAdminCategory>[1]
    }) => updateAdminCategory(id, payload),
    onSuccess: async () => {
      toast.success('Danh mục đã được cập nhật')
      await refresh()
      categoriesQuery.refetch()
    },
    onError: () => toast.error('Cập nhật danh mục thất bại')
  })

  const onCreate = useCallback(() => {
    editing.setCategory(null)
    clearDirty('category')
    modals.setCategory(true)
  }, [clearDirty, editing, modals])

  const onEdit = useCallback(
    (category: AdminCategory) => {
      editing.setCategory(category)
      clearDirty('category')
      modals.setCategory(true)
    },
    [clearDirty, editing, modals]
  )

  const onDelete = useCallback(
    async (category: AdminCategory): Promise<void> => {
      confirmDelete('Bạn có chắc chắn muốn xóa danh mục này?', async () => {
        await deleteCategoryAsync(category.id)
      })
    },
    [confirmDelete, deleteCategoryAsync]
  )

  const onBulkAdd = useCallback(() => {
    clearDirty('categoryBulk')
    modals.setBulkCategory(true)
  }, [clearDirty, modals])

  const onQuickUpdate = useCallback(
    async (
      category: AdminCategory,
      update: Partial<
        Pick<AdminCategory, 'parentId' | 'gender' | 'productType' | 'isActive'>
      >
    ): Promise<void> => {
      const parentId =
        update.parentId === undefined ? category.parentId : update.parentId

      await updateCategoryAsync({
        id: category.id,
        payload: {
          name: category.name,
          image: category.image,
          description: category.description,
          parentId,
          level: parentId ? 1 : 0,
          gender: update.gender ?? category.gender,
          productType:
            update.productType === undefined
              ? category.productType
              : update.productType,
          isActive: update.isActive ?? category.isActive
        }
      })
    },
    [updateCategoryAsync]
  )

  return (
    <div className="space-y-3">
      <AdminCategoriesToolbar
        filters={filters}
        parentFilterTreeData={parentFilterTreeData}
        selectedIds={selectedIds}
        hasSelection={hasSelection}
        refreshQuery={categoriesQuery}
        onFiltersChange={setFilters}
        onBulkAdd={onBulkAdd}
        onCreate={onCreate}
        onRefresh={refresh}
        onClearSelection={clearSelection}
      />
      <AdminCategoriesTable
        loading={categoriesQuery.isLoading}
        data={filteredData}
        rowSelection={rowSelection}
        getParentTreeData={getQuickUpdateParentTreeData}
        onQuickUpdate={onQuickUpdate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}
