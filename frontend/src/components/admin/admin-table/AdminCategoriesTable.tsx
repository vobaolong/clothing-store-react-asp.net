import { Empty, Image, Select, Switch, Table, TreeSelect } from 'antd'
import type { TablePaginationConfig } from 'antd/es/table'
import type { TableProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AdminCategory } from '@/types'
import { CategoryGender, CategoryType } from '@/enums'
import { formatDate } from '@/utils/format'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'
import type { buildCategoryTreeSelectData } from '@/utils/category-tree'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type AdminCategoriesTableProps = {
  loading: boolean
  data: AdminCategory[]
  rowSelection: TableProps<AdminCategory>['rowSelection']
  getParentTreeData: (
    rowId: string
  ) => ReturnType<typeof buildCategoryTreeSelectData>
  onQuickUpdate: (
    category: AdminCategory,
    update: Partial<
      Pick<AdminCategory, 'parentId' | 'gender' | 'productType' | 'isActive'>
    >
  ) => Promise<void>
  onEdit: (category: AdminCategory) => void
  onDelete: (category: AdminCategory) => void
}

const GENDER_OPTIONS = Object.values(CategoryGender).map((item) => ({
  label: getVietnameseLabel(item),
  value: item
}))

const PRODUCT_TYPE_OPTIONS = Object.values(CategoryType).map((item) => ({
  label: getVietnameseLabel(item),
  value: item
}))

export default function AdminCategoriesTable({
  loading,
  data,
  rowSelection,
  getParentTreeData,
  onQuickUpdate,
  onEdit,
  onDelete
}: AdminCategoriesTableProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const handleTableChange = useCallback((pag: TablePaginationConfig) => {
    setPage(pag.current ?? 1)
    setPageSize(pag.pageSize ?? 10)
  }, [])

  const columns = useMemo<ColumnsType<AdminCategory>>(
    () => [
      {
        title: '#',
        key: 'no',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => (
          <span className="font-semibold">
            {(page - 1) * pageSize + index + 1}
          </span>
        )
      },
      {
        title: t('admin.categoryNameLabel'),
        dataIndex: 'name',
        key: 'name',
        width: 250,
        sorter: (a, b) => a.name.localeCompare(b.name)
      },
      {
        title: t('common.image'),
        dataIndex: 'image',
        key: 'image',
        align: 'center',
        render: (value: string) =>
          value ? (
            <Image
              src={value}
              alt="Category"
              className="object-cover rounded-md size-12! self-center"
            />
          ) : (
            <span className="text-xs text-slate-500">{t('common.noImage')}</span>
          )
      },
      {
        title: t('admin.categoryParentLabel'),
        dataIndex: 'parentId',
        key: 'parentId',
        align: 'center',
        render: (value: string | null, row) => (
          <TreeSelect
            allowClear
            className="min-w-60"
            value={value ?? undefined}
            treeData={getParentTreeData(row.id)}
            placeholder={t('admin.categoryParentPlaceholder')}
            showSearch={{ treeNodeFilterProp: 'title' }}
            treeLine={{ showLeafIcon: false }}
            treeDefaultExpandAll
            onChange={async (parentId) => {
              await onQuickUpdate(row, {
                parentId:
                  parentId != null && parentId !== '' ? String(parentId) : null
              })
            }}
          />
        )
      },
      {
        title: t('admin.columnGender'),
        dataIndex: 'gender',
        key: 'gender',
        align: 'center',
        render: (value: CategoryGender, row) => (
          <Select
            className="min-w-32"
            value={value}
            options={GENDER_OPTIONS}
            onChange={async (gender: CategoryGender) => {
              await onQuickUpdate(row, {
                gender: gender
              })
            }}
          />
        )
      },
      {
        title: t('admin.columnCategoryType'),
        dataIndex: 'productType',
        key: 'productType',
        align: 'center',
        render: (value: CategoryType, row) => (
          <Select
            allowClear
            className="min-w-36"
            value={value}
            options={PRODUCT_TYPE_OPTIONS}
            optionLabelProp="label"
            placeholder="None"
            onChange={async (productType: CategoryType) => {
              await onQuickUpdate(row, {
                productType: productType
              })
            }}
          />
        )
      },
      {
        title: t('admin.columnActive'),
        dataIndex: 'isActive',
        key: 'isActive',
        align: 'center',
        render: (value: boolean, row) => (
          <Switch
            checked={value}
            onChange={async (checked) => {
              await onQuickUpdate(row, {
                isActive: checked
              })
            }}
          />
        )
      },
      {
        title: t('common.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value),
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      },
      {
        title: t('admin.columnUpdated'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (value: string) => formatDate(value),
        sorter: (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      },
      {
        title: t('common.action'),
        key: 'action',
        fixed: 'right',
        align: 'center',
        width: 100,
        render: (_, row) => (
          <AdminUpsertButtonActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      }
    ],
    [getParentTreeData, onQuickUpdate, onEdit, onDelete, page, pageSize]
  )

  return (
    <Table<AdminCategory>
      rowKey="id"
      loading={loading}
      bordered
      size="small"
      dataSource={data}
      rowSelection={rowSelection}
      columns={columns}
      scroll={{ x: 'max-content' }}
      onChange={handleTableChange}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `${t('common.total')} ${total} ${t('admin.categories').toLowerCase()}`
      }}
      locale={{ emptyText: <Empty description={t('common.noData')} /> }}
    />
  )
}
