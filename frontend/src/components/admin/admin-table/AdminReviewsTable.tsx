import { useMemo } from 'react'
import { Avatar, Button, Empty, Popconfirm, Rate, Table, Tag } from 'antd'
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface'
import { DeleteOutlined, UserOutlined } from '@ant-design/icons'
import type { Review } from '@/types'
import { formatDate } from '@/utils/format'
import { useTranslation } from 'react-i18next'

interface AdminReviewsTableProps {
  dataSource: Review[]
  loading: boolean
  current: number
  pageSize: number
  totalCount: number
  onPaginationChange: (page: number, pageSize: number) => void
  selectedRowKeys: React.Key[]
  onSelectionChange: (keys: React.Key[]) => void
  onDelete: (id: string) => Promise<void>
}

export default function AdminReviewsTable({
  dataSource,
  loading,
  current,
  pageSize,
  totalCount,
  onPaginationChange,
  selectedRowKeys,
  onSelectionChange,
  onDelete
}: AdminReviewsTableProps) {
  const { t } = useTranslation()
  const rowSelection: TableRowSelection<Review> = {
    selectedRowKeys,
    onChange: (keys) => {
      onSelectionChange(keys)
    }
  }

  const columns = useMemo<ColumnsType<Review>>(
    () => [
      {
        title: '#',
        align: 'center',
        width: 70,
        fixed: 'left',
        render: (_, __, index) => {
          return (current - 1) * pageSize + index + 1
        }
      },
      {
        title: t('admin.columnUser'),
        key: 'user',
        width: 250,
        render: (_, row) => (
          <div className="flex items-center gap-2.5">
            <Avatar
              icon={<UserOutlined />}
              className="border border-blue-100 bg-blue-50 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold truncate max-w-45">
                {row.userFullName || '—'}
              </span>
              <span className="text-xs truncate max-w-45">
                {row.userEmail || '—'}
              </span>
            </div>
          </div>
        )
      },
      {
        title: t('product.products'),
        key: 'product',
        width: 280,
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <img
              src={row.productImage}
              alt={row.productName}
              className="object-cover border size-15 rounded-md border-slate-100 shrink-0"
            />
            <span className="font-medium line-clamp-2 max-w-50">
              {row.productName}
            </span>
          </div>
        )
      },
      {
        title: t('review.review'),
        dataIndex: 'rating',
        key: 'rating',
        width: 140,
        render: (value: number) => (
          <Rate
            disabled
            className="text-xs text-yellow-400"
            value={value}
            style={{ fontSize: 13 }}
          />
        )
      },
      {
        title: t('admin.columnContent'),
        key: 'contentAndTags',
        width: 350,
        render: (_, row) => (
          <div className="space-y-1.5 py-1">
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {row.comment || (
                <span className="text-xs italic text-slate-400">
                  {t('admin.noComment')}
                </span>
              )}
            </div>
            {row.tags && row.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {row.tags.map((tag) => (
                  <Tag
                    key={tag}
                    color="blue"
                    className="m-0 text-xs px-1.5 py-0.5 rounded border-blue-100 bg-blue-50"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        )
      },
      {
        title: t('admin.columnDate'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        width: 200,
        render: (value: string) => (
          <span className="text-sm">{formatDate(value)}</span>
        )
      },
      {
        title: t('common.action'),
        align: 'center',
        fixed: 'right',
        width: 100,
        render: (_, row) => (
          <Popconfirm
            title={t('admin.reviewDeleteConfirm')}
            okText={t('admin.reviewDeleteOk')}
            cancelText={t('admin.reviewDeleteCancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(row.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )
      }
    ],
    [onDelete, current, pageSize, t]
  )

  return (
    <div className="space-y-4">
      <Table
        rowKey="id"
        rowSelection={rowSelection}
        loading={loading}
        bordered
        dataSource={dataSource}
        size="small"
        columns={columns}
        pagination={{
          current,
          pageSize,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) =>
            `${t('common.total')}: ${total} ${t('admin.reviews').toLowerCase()}`,
          onChange: onPaginationChange
        }}
        locale={{
          emptyText: <Empty description={t('common.noData')} />
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}
