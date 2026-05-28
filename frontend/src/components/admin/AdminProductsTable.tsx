import { Button, Switch, Table, Tooltip, Typography } from 'antd'
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface'
import toast from 'react-hot-toast'
import { AdminTableEditDeleteActions } from '@/components/admin/AdminTableEditDeleteActions'
import type { AdminProduct } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { toCapitalize } from '@/utils/table.lib'
import { getAdminProductThumbnail } from '@/components/admin/admin-products-utils'
import { UndoOutlined } from '@ant-design/icons'

type AdminProductsTableProps = {
  dataSource: AdminProduct[]
  loading: boolean
  isTrash: boolean
  rowSelection: TableRowSelection<AdminProduct>
  onView: (product: AdminProduct, updatedAt?: string | null) => void
  onEdit: (product: AdminProduct) => void
  onDelete: (product: AdminProduct) => void
  onRestore?: (product: AdminProduct) => Promise<void>
  onToggleActive: (product: AdminProduct, isActive: boolean) => Promise<void>
  onRefresh: () => Promise<void>
}

export default function AdminProductsTable({
  dataSource,
  loading,
  isTrash,
  rowSelection,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onToggleActive,
  onRefresh,
}: AdminProductsTableProps) {
  void onRestore
  void onRefresh
  const rowNumberById = new Map(
    dataSource.map((product, index) => [product.id, index + 1]),
  )

  const columns: ColumnsType<AdminProduct> = isTrash
    ? [
        {
          title: '#',
          key: 'no',
          align: 'center',
          width: 60,
          fixed: 'left',
          render: (_: unknown, row: AdminProduct) => rowNumberById.get(row.id),
        },
        {
          title: 'Tên sản phẩm',
          dataIndex: 'name',
          render: (value: string) => (
            <Tooltip title={value}>
              <div className='line-clamp-2 max-w-56'>{toCapitalize(value)}</div>
            </Tooltip>
          ),
        },
        {
          title: 'Ảnh',
          dataIndex: 'imageUrl',
          render: (_: unknown, row: AdminProduct) => {
            const src = getAdminProductThumbnail(row)
            if (!src) {
              return (
                <div className='flex justify-center items-center rounded-md size-20 bg-slate-100'>
                  <Typography.Text type='secondary' style={{ fontSize: 10 }}>
                    No image
                  </Typography.Text>
                </div>
              )
            }
            return (
              <img
                src={src}
                alt='Product'
                className='object-cover rounded-md size-20'
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            )
          },
        },
        {
          title: 'Thao tác',
          align: 'center',
          width: 100,
          fixed: 'right',
          render: (_: unknown, row: AdminProduct) => (
            <Tooltip title='Khôi phục'>
              <Button
                icon={<UndoOutlined />}
                onClick={() => onRestore?.(row)}
              />
            </Tooltip>
          ),
        },
      ]
    : [
        {
          title: '#',
          dataIndex: 'no',
          align: 'center',
          width: 60,
          fixed: 'left',
          render: (_: unknown, row: AdminProduct) => rowNumberById.get(row.id),
        },
        {
          title: 'Tên sản phẩm',
          dataIndex: 'name',
          render: (value: string) => (
            <Tooltip title={value}>
              <div className='line-clamp-2 max-w-56'>{toCapitalize(value)}</div>
            </Tooltip>
          ),
        },
        {
          title: 'Ảnh',
          dataIndex: 'imageUrl',
          align: 'center',
          render: (_: unknown, row: AdminProduct) => {
            const src = getAdminProductThumbnail(row)
            if (!src) {
              return (
                <div className='flex justify-center items-center rounded-md size-16 bg-slate-100'>
                  <Typography.Text type='secondary' style={{ fontSize: 10 }}>
                    No image
                  </Typography.Text>
                </div>
              )
            }
            return (
              <img
                src={src}
                alt='Product'
                className='object-cover rounded-md size-16'
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            )
          },
        },
        { title: 'Mã SP', dataIndex: 'productCode' },
        { title: 'Danh mục', dataIndex: 'categoryName' },
        {
          title: 'Giá gốc',
          dataIndex: 'price',
          align: 'right',
          render: (value: number) => formatCurrency(value),
        },
        {
          title: 'Giá sale',
          dataIndex: 'salePrice',
          align: 'right',
          render: (value: number) => formatCurrency(value),
        },
        {
          title: 'Tồn kho',
          dataIndex: 'stock',
          align: 'right',
        },
        {
          title: 'Đã bán',
          dataIndex: 'soldCount',
          align: 'right',
        },
        {
          title: 'Kích hoạt',
          dataIndex: 'isActive',
          align: 'center',
          render: (value: boolean, row: AdminProduct) => (
            <Switch
              checked={value}
              onChange={async (nextValue) => {
                try {
                  await onToggleActive(row, nextValue)
                } catch {
                  toast.error('Update failed')
                }
              }}
            />
          ),
        },
        {
          title: 'Ngày tạo',
          dataIndex: 'createdAt',
          render: (value: string) => formatDate(value),
        },
        {
          title: 'Thao tác',
          align: 'center',
          fixed: 'right',
          render: (_: unknown, row: AdminProduct) => (
            <AdminTableEditDeleteActions
              row={row}
              onView={(product) => onView(product, product.updatedAt)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ),
        },
      ]

  return (
    <Table
      rowKey='id'
      bordered
      loading={loading}
      dataSource={dataSource}
      rowSelection={rowSelection}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `Tổng ${total} sản phẩm`,
      }}
      columns={columns}
    />
  )
}
