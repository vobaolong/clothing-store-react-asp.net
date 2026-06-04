import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, FloatButton } from 'antd'
import AdminListFilters from '@/components/admin/AdminListFilters'
import { AdminRefreshButtonAction } from '@/components/admin/AdminRefreshButtonAction'
import AdminCategoriesSelectionActions from '@/components/admin/admin-selection-action/AdminCategoriesSelectionActions'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import {
  ADMIN_ACTIVE_FILTER_OPTIONS,
  ADMIN_CATEGORY_GENDER_FILTER_OPTIONS,
  ADMIN_CATEGORY_TYPE_FILTER_OPTIONS
} from '@/options/admin-filter.options'
import type { UseQueryResult } from '@tanstack/react-query'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'

export type AdminCategoryFilters = {
  search: string
  parent: string
  gender: string
  type: string
  active: string
}

type Props = {
  filters: AdminCategoryFilters
  parentFilterTreeData: ReturnType<typeof buildCategoryTreeSelectData>
  selectedIds: string[]
  hasSelection: boolean
  refreshQuery: UseQueryResult<unknown, Error>
  onFiltersChange: (
    updater: (prev: AdminCategoryFilters) => AdminCategoryFilters
  ) => void
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
  onCreate,
  onRefresh,
  onClearSelection
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex-wrap items-center justify-end hidden w-full gap-2 sm:flex sm:ml-auto sm:w-auto">
        {hasSelection && (
          <AdminCategoriesSelectionActions
            selectedIds={selectedIds}
            onClearSelection={onClearSelection}
            onRefresh={onRefresh}
          />
        )}
        <AdminRefreshButtonAction query={refreshQuery} />
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Thêm danh mục
        </Button>
      </div>
      <AdminListFilters
        searchValue={filters.search}
        onSearchChange={(value) =>
          onFiltersChange((prev) => ({ ...prev, search: value }))
        }
        searchPlaceholder="Tìm theo tên, slug, mô tả, ID…"
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
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ bottom: 24, right: 24 }}
        icon={<PlusOutlined />}
        className="sm:hidden!"
      >
        <FloatButton
          icon={<PlusOutlined />}
          onClick={onCreate}
          tooltip="Thêm danh mục"
        />
        <FloatButton
          icon={<ReloadOutlined />}
          onClick={() => refreshQuery.refetch()}
          tooltip="Tải lại"
        />
      </FloatButton.Group>
    </div>
  )
}
