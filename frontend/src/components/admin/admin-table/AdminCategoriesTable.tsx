import { Empty, Select, Switch, Table, TreeSelect } from 'antd'
import { useMemo } from 'react'
import type { TableProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AdminCategory } from '@/types'
import { CategoryGender, CategoryType } from '@/enums'
import type {
  CategoryGender as CategoryGenderType,
  CategoryType as CategoryTypeType
} from '@/enums'
import { formatDate } from '@/utils/format'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'
import type { buildCategoryTreeSelectData } from '@/utils/category-tree'

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
  label: getVietnameseStatusLabel(item),
  value: item
}))

const PRODUCT_TYPE_OPTIONS = Object.values(CategoryType).map((item) => ({
  label: getVietnameseStatusLabel(item),
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
  const columns = useMemo<ColumnsType<AdminCategory>>(
    () => [
      {
        title: '#',
        key: 'no',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => (
          <span className="font-semibold">{index + 1}</span>
        )
      },
      {
        title: 'Tên danh mục',
        dataIndex: 'name',
        key: 'name',
        width: 250,
        sorter: (a, b) => a.name.localeCompare(b.name)
      },
      {
        title: 'Ảnh',
        dataIndex: 'image',
        key: 'image',
        align: 'center',
        render: (value: string) =>
          value ? (
            <img
              src={value}
              alt="Category"
              className="object-cover w-16 h-16 rounded"
            />
          ) : (
            <span className="text-xs text-slate-500">Không có ảnh</span>
          )
      },
      {
        title: 'Danh mục cha',
        dataIndex: 'parentId',
        key: 'parentId',
        align: 'center',
        render: (value: string | null, row) => (
          <TreeSelect
            allowClear
            className="min-w-60"
            value={value ?? undefined}
            treeData={getParentTreeData(row.id)}
            placeholder="Không có danh mục cha"
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
        title: 'Giới tính',
        dataIndex: 'gender',
        key: 'gender',
        align: 'center',
        render: (value: CategoryGenderType, row) => (
          <Select
            className="min-w-32"
            value={value}
            options={GENDER_OPTIONS}
            onChange={async (gender) => {
              await onQuickUpdate(row, {
                gender
              })
            }}
          />
        )
      },
      {
        title: 'Loại danh mục',
        dataIndex: 'productType',
        key: 'productType',
        align: 'center',
        render: (value: CategoryTypeType | undefined, row) => (
          <Select
            allowClear
            className="min-w-36"
            value={value}
            options={PRODUCT_TYPE_OPTIONS}
            placeholder="None"
            onChange={async (productType) => {
              await onQuickUpdate(row, {
                productType
              })
            }}
          />
        )
      },
      {
        title: 'Kích hoạt',
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
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value),
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      },
      {
        title: 'Ngày cập nhật',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (value: string) => formatDate(value),
        sorter: (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      },
      {
        title: 'Thao tác',
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
    [getParentTreeData, onQuickUpdate, onEdit, onDelete]
  )

  return (
    <Table<AdminCategory>
      rowKey="id"
      loading={loading}
      bordered
      dataSource={data}
      rowSelection={rowSelection}
      columns={columns}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `Tổng ${total} danh mục`
      }}
      locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
    />
  )
}
