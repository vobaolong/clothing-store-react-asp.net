import { Empty, Select, Switch, Table, TreeSelect } from 'antd'
import { useMemo } from 'react'
import type { TableProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AdminCategory } from '@/types'
import { CategoryGender, CategoryProductType } from '@/enums'
import type {
  CategoryGender as CategoryGenderType,
  CategoryProductType as CategoryProductTypeType
} from '@/enums'
import { formatDate } from '@/utils/format'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { AdminTableEditDeleteActions } from '@/features/admin/components/admin-table-edit-delete-actions'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'

type Props = {
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

export default function AdminCategoriesTable({
  loading,
  data,
  rowSelection,
  getParentTreeData,
  onQuickUpdate,
  onEdit,
  onDelete
}: Props) {
  const columns: ColumnsType<AdminCategory> = useMemo(
    () => [
      {
        title: '#',
        key: 'no',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_: unknown, row: AdminCategory) => (
          <span className='font-semibold'>{data.indexOf(row) + 1}</span>
        )
      },
      {
        title: 'Tên danh mục',
        dataIndex: 'name',
        width: 250,
        sorter: (a: AdminCategory, b: AdminCategory) =>
          a.name.localeCompare(b.name)
      },
      {
        title: 'Ảnh',
        dataIndex: 'image',
        align: 'center',
        render: (value: string) =>
          value ? (
            <img
              src={value}
              alt='Category'
              className='object-cover w-16 h-16 rounded'
            />
          ) : (
            <span className='text-xs text-slate-500'>Không có ảnh</span>
          )
      },
      {
        title: 'Danh mục cha',
        dataIndex: 'parentId',
        align: 'center',
        render: (value: string | null, row: AdminCategory) => (
          <TreeSelect
            allowClear
            className='min-w-60'
            value={value ?? undefined}
            treeData={getParentTreeData(row.id)}
            placeholder='Không có danh mục cha'
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
        align: 'center',
        render: (value: string, row: AdminCategory) => (
          <Select
            className='min-w-32'
            value={value}
            options={Object.values(CategoryGender).map((item) => ({
              label: getVietnameseStatusLabel(item),
              value: item
            }))}
            onChange={async (gender) => {
              await onQuickUpdate(row, {
                gender: gender as CategoryGenderType
              })
            }}
          />
        )
      },
      {
        title: 'Loại danh mục',
        dataIndex: 'productType',
        align: 'center',
        render: (value: string | undefined, row: AdminCategory) => (
          <Select
            allowClear
            className='min-w-36'
            value={value}
            options={Object.values(CategoryProductType).map((item) => ({
              label: getVietnameseStatusLabel(item),
              value: item
            }))}
            placeholder='None'
            onChange={async (productType) => {
              await onQuickUpdate(row, {
                productType: productType as CategoryProductTypeType | undefined
              })
            }}
          />
        )
      },
      {
        title: 'Kích hoạt',
        dataIndex: 'isActive',
        align: 'center',
        render: (value: boolean, row: AdminCategory) => (
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
        render: (value: string) => formatDate(value),
        sorter: (a: AdminCategory, b: AdminCategory) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      },
      {
        title: 'Ngày cập nhật',
        dataIndex: 'updatedAt',
        render: (value: string) => formatDate(value),
        sorter: (a: AdminCategory, b: AdminCategory) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      },
      {
        title: 'Thao tác',
        fixed: 'right',
        align: 'center',
        render: (_, row: AdminCategory) => (
          <AdminTableEditDeleteActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      }
    ],
    [data, getParentTreeData, onQuickUpdate, onEdit, onDelete]
  )

  return (
    <Table
      rowKey='id'
      loading={loading}
      bordered
      dataSource={data}
      rowSelection={rowSelection}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `Tổng ${total} danh mục`
      }}
      locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
      columns={columns}
    />
  )
}
