import { PlusOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Segmented, FloatButton } from 'antd'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import AdminListFilters from '@/components/admin/AdminListFilters'

import type { AdminProduct, AdminProductListMode } from '@/types'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'
import {
  AdminRefreshButtonAction,
  type AdminRefreshQuery
} from '../AdminRefreshButtonAction'
import { useAdminFilterOptions } from '@/options'

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
  const { t } = useTranslation()
  const { active } = useAdminFilterOptions()
  return (
    <>
      <Segmented<AdminProductListMode>
        value={listMode}
        onChange={(value) => onListModeChange(value)}
        options={[
          { label: t('admin.sectionProductsActive'), value: 'active' },
          { label: t('admin.sectionProductsDeleted'), value: 'deleted' }
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex-wrap justify-end hidden w-full sm:flex gap-2 sm:ml-auto sm:w-auto">
          {selectedActions}
          <AdminRefreshButtonAction query={refreshQuery} />
          <Button icon={<UploadOutlined />} onClick={onImportExcel}>
            {t('admin.importExcel')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            {t('admin.createProduct')}
          </Button>
        </div>
        <AdminListFilters
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={t('admin.searchProductsPlaceholder')}
          searchClassName="w-full sm:max-w-sm"
          selects={[
            {
              kind: 'tree',
              value:
                categoryId === ADMIN_FILTER_ALL_VALUE ? undefined : categoryId,
              treeData: categoryTreeData,
              placeholder: t('admin.filterAllCategories'),
              onChange: onCategoryChange,
              className: 'min-w-56'
            },
            {
              value: activeValue,
              options: [...active],
              onChange: onActiveChange,
              className: 'min-w-36'
            },
            {
              kind: 'date-range',
              value: dateRange,
              onChange: onDateRangeChange,
              placeholder: [t('admin.filterDateFrom'), t('admin.filterDateTo')],
              className: 'w-full sm:w-auto'
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
            tooltip={t('admin.tooltipCreateProduct')}
          />
          <FloatButton
            icon={<UploadOutlined />}
            onClick={onImportExcel}
            tooltip={t('admin.tooltipImportExcel')}
          />
          <FloatButton
            icon={<ReloadOutlined />}
            onClick={() => refreshQuery.refetch()}
            tooltip={t('admin.tooltipRefreshData')}
          />
        </FloatButton.Group>
      </div>
    </>
  )
}
