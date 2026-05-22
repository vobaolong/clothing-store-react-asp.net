import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import AdminListFilters from '@/features/admin/components/admin-list-filters'
import { AdminQueryRefreshButton } from '@/features/admin/components/admin-query-refresh-button'
import AdminCategoriesBulkActions from '@/features/admin/components/admin-categories-bulk-actions'
import {
  ADMIN_ACTIVE_FILTER_OPTIONS,
  ADMIN_CATEGORY_GENDER_FILTER_OPTIONS,
  ADMIN_CATEGORY_TYPE_FILTER_OPTIONS,
  ADMIN_FILTER_ALL_VALUE
} from '@/constants/admin-filter.constant'
import type { UseQueryResult } from '@tanstack/react-query'

export type AdminCategoryFilters = {
  search: string
  parent: string
  gender: string
  type: string
  active: string
}

type Props = {
  filters: AdminCategoryFilters
  parentFilterTreeData: Array<{
    title: string
    value: string
    children?: unknown[]
  }>
  selectedIds: string[]
  hasSelection: boolean
  refreshQuery: UseQueryResult<unknown, Error>
  onFiltersChange: (
    updater: (prev: AdminCategoryFilters) => AdminCategoryFilters
  ) => void
  onBulkAdd: () => void
  onCreate: () => void
  onRefresh: () => Promise<void>
  onClearSelection: () => void
}

export default function AdminCategoriesToolbar({
  filters,
  parentFilterTreeData,
  selectedIds,
  hasSelection,
  refreshQuery,
  onFiltersChange,
  onBulkAdd,
  onCreate,
  onRefresh,
  onClearSelection
}: Props) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
      <div className='flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto'>
        {hasSelection && (
          <AdminCategoriesBulkActions
            selectedIds={selectedIds}
            onClearSelection={onClearSelection}
            onRefresh={onRefresh}
          />
        )}
        <Button onClick={onBulkAdd}>Thêm hàng loạt</Button>
        <AdminQueryRefreshButton query={refreshQuery} />
        <Button type='primary' icon={<PlusOutlined />} onClick={onCreate}>
          Thêm danh mục
        </Button>
      </div>
      <AdminListFilters
        searchValue={filters.search}
        onSearchChange={(value) =>
          onFiltersChange((prev) => ({ ...prev, search: value }))
        }
        searchPlaceholder='Tìm theo tên, slug, mô tả, ID…'
        selects={[
          {
            kind: 'tree',
            value:
              filters.parent === ADMIN_FILTER_ALL_VALUE
                ? undefined
                : filters.parent,
            treeData: parentFilterTreeData,
            placeholder: 'Tất cả danh mục cha',
            onChange: (value) =>
              onFiltersChange((prev) => ({
                ...prev,
                parent: value ?? ADMIN_FILTER_ALL_VALUE
              })),
            className: 'min-w-56'
          },
          {
            value: filters.gender,
            options: [...ADMIN_CATEGORY_GENDER_FILTER_OPTIONS],
            onChange: (value: string) =>
              onFiltersChange((prev) => ({ ...prev, gender: value })),
            className: 'min-w-36'
          },
          {
            value: filters.type,
            options: [...ADMIN_CATEGORY_TYPE_FILTER_OPTIONS],
            onChange: (value: string) =>
              onFiltersChange((prev) => ({ ...prev, type: value })),
            className: 'min-w-40'
          },
          {
            value: filters.active,
            options: [...ADMIN_ACTIVE_FILTER_OPTIONS],
            onChange: (value: string) =>
              onFiltersChange((prev) => ({ ...prev, active: value })),
            className: 'min-w-36'
          }
        ]}
      />
    </div>
  )
}
