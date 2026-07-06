import { Button, Image, Switch, Table, Tooltip } from 'antd'
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface'
import toast from 'react-hot-toast'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'
import type { AdminProduct } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { toCapitalize } from '@/utils/table.lib'
import { getAdminProductThumbnail } from '@/components/admin/admin-products-utils'
import { UndoOutlined } from '@ant-design/icons'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TablePaginationConfig } from 'antd/es/table/interface'

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
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const handleTableChange = useCallback((pag: TablePaginationConfig) => {
    setPage(pag.current ?? 1)
    setPageSize(pag.pageSize ?? 10)
  }, [])

  const renderProductImage = (row: AdminProduct) => {
    const src = getAdminProductThumbnail(row)
    if (!src) {
      return (
        <div
          className={`flex justify-center items-center rounded-md size-16! bg-slate-100`}
        >
          <span className="text-xs text-slate-500">{t('common.noImage')}</span>
        </div>
      )
    }

    return (
      <Image
        src={src}
        alt="Product"
        className="object-cover rounded-md size-12! self-center"
        preview
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
        render: (_, __, index) => (page - 1) * pageSize + index + 1
      },
      {
        title: t('product.productName'),
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
          title: t('common.image'),
          dataIndex: 'imageUrl',
          key: 'imageUrl',
          render: (_, row) => renderProductImage(row)
        },
        {
          title: t('common.action'),
          key: 'action',
          align: 'center',
          width: 100,
          fixed: 'right',
          render: (_, row) => (
            <Tooltip title={t('admin.restoreButton')}>
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
        title: t('common.image'),
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        align: 'center',
        render: (_, row) => renderProductImage(row)
      },
      { title: t('admin.columnCode'), dataIndex: 'productCode', key: 'productCode' },
      { title: t('product.category'), dataIndex: 'categoryName', key: 'categoryName' },
      {
        title: t('product.originalPrice'),
        dataIndex: 'price',
        width: 120,
        key: 'price',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: t('admin.columnSalePrice'),
        dataIndex: 'salePrice',
        width: 120,
        key: 'salePrice',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: t('admin.columnStock'),
        dataIndex: 'stock',
        key: 'stock',
        align: 'right'
      },
      {
        title: t('admin.columnSold'),
        dataIndex: 'soldCount',
        key: 'soldCount',
        align: 'right'
      },
      {
        title: t('admin.columnActive'),
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
        title: t('common.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: t('common.action'),
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
  }, [
    isTrash,
    onView,
    onEdit,
    onDelete,
    onRestore,
    onToggleActive,
    page,
    pageSize
  ])

  return (
    <Table
      rowKey="id"
      bordered
      loading={loading}
      dataSource={dataSource}
      rowSelection={rowSelection}
      columns={columns}
      scroll={{ x: 'max-content' }}
      size="small"
      onChange={handleTableChange}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `${t('common.total')} ${total} ${t('product.products').toLowerCase()}`
      }}
    />
  )
}
