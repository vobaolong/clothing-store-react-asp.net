import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AdminCategory } from '@/types'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import {
  buildCategoryTreeSelectData,
  removeCategorySubtreeFromTree
} from '@/utils/category-tree'
import { useTableSelection } from '@/hooks/useTableSelection'
import { getAdminCategories, updateAdminCategory } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/context/admin/AdminContext'
import AdminCategoriesToolbar from '@/components/admin/AdminCategoriesToolbar'
import AdminCategoriesTable from '@/components/admin/AdminCategoriesTable'
import type { AdminCategoryFilters } from '@/components/admin/AdminCategoriesToolbar'

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
    (category: AdminCategory) =>
      confirmDelete('Bạn có chắc chắn muốn xóa danh mục này?', async () => {
        const { deleteAdminCategory } = await import('@/api/admin-api')
        await deleteAdminCategory(category.id)
        toast.success('Danh mục đã được xóa')
        await refresh()
      }),
    [confirmDelete, refresh]
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
    ) => {
      const parentId =
        update.parentId === undefined ? category.parentId : update.parentId

      await updateAdminCategory(category.id, {
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
      })
      toast.success('Danh mục đã được cập nhật')
      await refresh()
    },
    [refresh]
  )

  const parentFilterTreeData = useMemo(() => {
    const tree = buildCategoryTreeSelectData(data)
    return [{ title: 'Không có danh mục cha', value: '__root__' }, ...tree]
  }, [data])

  const filteredData = useMemo(() => {
    const needle = adminSearchNeedle(filters.search)
    return data.filter((category) => {
      const searchMatch =
        !needle ||
        adminRowMatches(
          needle,
          category.name,
          category.slug,
          category.id,
          category.description,
          category.image
        )
      const parentMatch =
        filters.parent === ADMIN_FILTER_ALL_VALUE
          ? true
          : filters.parent === '__root__'
            ? !category.parentId
            : category.parentId === filters.parent
      const genderMatch =
        filters.gender === ADMIN_FILTER_ALL_VALUE
          ? true
          : category.gender === filters.gender
      const typeMatch =
        filters.type === ADMIN_FILTER_ALL_VALUE
          ? true
          : (category.productType ?? '') === filters.type
      const activeMatch =
        filters.active === ADMIN_FILTER_ALL_VALUE
          ? true
          : filters.active === 'true'
            ? category.isActive
            : !category.isActive

      return (
        searchMatch && parentMatch && genderMatch && typeMatch && activeMatch
      )
    })
  }, [data, filters])

  const getQuickUpdateParentTreeData = useMemo(() => {
    const fullTree = buildCategoryTreeSelectData(data)
    return (rowId: string) => removeCategorySubtreeFromTree(fullTree, rowId)
  }, [data])

  return (
    <div className='space-y-3'>
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
