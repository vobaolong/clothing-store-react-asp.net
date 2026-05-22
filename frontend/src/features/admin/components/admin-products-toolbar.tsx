import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Segmented } from 'antd'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import {
  ADMIN_ACTIVE_FILTER_OPTIONS,
  ADMIN_FILTER_ALL_VALUE
} from '@/constants/admin-filter.constant'
import AdminListFilters from '@/features/admin/components/admin-list-filters'
import {
  AdminQueryRefreshButton,
  type AdminRefreshQuery
} from '@/features/admin/components/admin-query-refresh-button'
import type { AdminProduct } from '@/types'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'
import type { AdminProductListMode } from '@/features/admin/sections/admin-products-section'

type AdminProductsToolbarProps = {
  listMode: AdminProductListMode
  onListModeChange: (value: AdminProductListMode) => void
  refreshQuery: AdminRefreshQuery<AdminProduct[], Error>
  onImportExcel: () => void
  onCreate: () => void
  selectedActions?: ReactNode
  searchValue: string
  onSearchChange: (value: string) => void
  categoryId: string
  categoryTreeData: ReturnType<typeof buildCategoryTreeSelectData>
  onCategoryChange: (value: string | undefined) => void
  activeValue: string
  onActiveChange: (value: string) => void
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null]
  onDateRangeChange: (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => void
}

export default function AdminProductsToolbar({
  listMode,
  onListModeChange,
  refreshQuery,
  onImportExcel,
  onCreate,
  selectedActions,
  searchValue,
  onSearchChange,
  categoryId,
  categoryTreeData,
  onCategoryChange,
  activeValue,
  onActiveChange,
  dateRange,
  onDateRangeChange
}: AdminProductsToolbarProps) {
  return (
    <>
      <Segmented<AdminProductListMode>
        value={listMode}
        onChange={(value) => onListModeChange(value)}
        options={[
          { label: 'Sản phẩm hoạt động', value: 'active' },
          { label: 'Sản phẩm đã xóa', value: 'deleted' }
        ]}
      />

      <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
        <div className='flex w-full flex-wrap justify-end gap-2 sm:ml-auto sm:w-auto'>
          {selectedActions}
          <AdminQueryRefreshButton query={refreshQuery} />
          <Button icon={<UploadOutlined />} onClick={onImportExcel}>
            Import Excel
          </Button>
          <Button type='primary' icon={<PlusOutlined />} onClick={onCreate}>
            Thêm sản phẩm
          </Button>
        </div>
        <AdminListFilters
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder='Tìm theo mã SP, slug, danh mục, ID…'
          searchClassName='w-full sm:max-w-sm'
          selects={[
            {
              kind: 'tree',
              value:
                categoryId === ADMIN_FILTER_ALL_VALUE ? undefined : categoryId,
              treeData: categoryTreeData,
              placeholder: 'Tất cả danh mục',
              onChange: onCategoryChange,
              className: 'min-w-56'
            },
            {
              value: activeValue,
              options: [...ADMIN_ACTIVE_FILTER_OPTIONS],
              onChange: onActiveChange,
              className: 'min-w-36'
            },
            {
              kind: 'date-range',
              value: dateRange,
              onChange: onDateRangeChange,
              placeholder: ['Từ ngày', 'Đến ngày'],
              className: 'w-full sm:w-auto'
            }
          ]}
        />
      </div>
    </>
  )
}
