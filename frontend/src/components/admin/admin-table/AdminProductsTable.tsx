import { Button, Switch, Table, Tooltip, Typography } from 'antd'
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface'
import toast from 'react-hot-toast'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'
import type { AdminProduct } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { toCapitalize } from '@/utils/table.lib'
import { getAdminProductThumbnail } from '@/components/admin/admin-products-utils'
import { UndoOutlined } from '@ant-design/icons'
import { useMemo } from 'react'

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
  onToggleActive
}: AdminProductsTableProps) {
  const renderProductImage = (row: AdminProduct, sizeClass: string) => {
    const src = getAdminProductThumbnail(row)
    if (!src) {
      return (
        <div
          className={`flex justify-center items-center rounded-md ${sizeClass} bg-slate-100`}
        >
          <Typography.Text type="secondary" style={{ fontSize: 10 }}>
            No image
          </Typography.Text>
        </div>
      )
    }
    return (
      <img
        src={src}
        alt="Product"
        className={`object-cover rounded-md ${sizeClass}`}
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  const columns = useMemo<ColumnsType<AdminProduct>>(() => {
    const baseColumns: ColumnsType<AdminProduct> = [
      {
        title: '#',
        key: 'no',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1
      },
      {
        title: 'Tên sản phẩm',
        dataIndex: 'name',
        key: 'name',
        render: (value: string) => (
          <Tooltip title={value}>
            <div className="line-clamp-2 max-w-56">{toCapitalize(value)}</div>
          </Tooltip>
        )
      }
    ]

    if (isTrash) {
      return [
        ...baseColumns,
        {
          title: 'Ảnh',
          dataIndex: 'imageUrl',
          key: 'imageUrl',
          render: (_, row) => renderProductImage(row, 'size-20')
        },
        {
          title: 'Thao tác',
          key: 'action',
          align: 'center',
          width: 100,
          fixed: 'right',
          render: (_, row) => (
            <Tooltip title="Khôi phục">
              <Button
                icon={<UndoOutlined />}
                onClick={() => onRestore?.(row)}
              />
            </Tooltip>
          )
        }
      ]
    }

    return [
      ...baseColumns,
      {
        title: 'Ảnh',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        align: 'center',
        render: (_, row) => renderProductImage(row, 'size-16')
      },
      { title: 'Mã SP', dataIndex: 'productCode', key: 'productCode' },
      { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName' },
      {
        title: 'Giá gốc',
        dataIndex: 'price',
        key: 'price',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Giá sale',
        dataIndex: 'salePrice',
        key: 'salePrice',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Tồn kho',
        dataIndex: 'stock',
        key: 'stock',
        align: 'right'
      },
      {
        title: 'Đã bán',
        dataIndex: 'soldCount',
        key: 'soldCount',
        align: 'right'
      },
      {
        title: 'Kích hoạt',
        dataIndex: 'isActive',
        key: 'isActive',
        align: 'center',
        render: (value: boolean, row) => (
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
        )
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Thao tác',
        key: 'action',
        align: 'center',
        fixed: 'right',
        render: (_, row) => (
          <AdminUpsertButtonActions
            row={row}
            onView={(product) => onView(product, product.updatedAt)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      }
    ]
  }, [isTrash, onView, onEdit, onDelete, onRestore, onToggleActive])

  return (
    <Table<AdminProduct>
      rowKey="id"
      bordered
      loading={loading}
      dataSource={dataSource}
      rowSelection={rowSelection}
      columns={columns}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `Tổng ${total} sản phẩm`
      }}
    />
  )
}
