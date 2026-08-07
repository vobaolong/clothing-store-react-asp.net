import { useMemo } from 'react'
import { Table, Tag, Button, Empty } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TierConfig } from '@/types'
import { formatCurrency } from '@/utils/format'
import { useTranslation } from 'react-i18next'

interface AdminTierConfigTableProps {
  dataSource: TierConfig[]
  loading: boolean
  current: number
  pageSize: number
  onEdit: (config: TierConfig) => void
  onDelete: (config: TierConfig) => void
  totalCount: number
  onPaginationChange: (page: number, pageSize: number) => void
}

export default function AdminTierConfigTable({
  dataSource,
  loading,
  current,
  pageSize,
  onEdit,
  onDelete,
  totalCount,
  onPaginationChange
}: AdminTierConfigTableProps) {
  const { t } = useTranslation()

  const columns = useMemo<ColumnsType<TierConfig>>(
    () => [
      {
        title: '#',
        key: 'index',
        align: 'center',
        width: 70,
        fixed: 'left',
        render: (_, __, index) => {
          return (current - 1) * pageSize + index + 1
        }
      },
      {
        title: t('admin.tierName'),
        dataIndex: 'tier',
        key: 'tier',
        render: (tier: string) => (
          <Tag
            color={
              tier === 'Bronze'
                ? '#cd7f32'
                : tier === 'Silver'
                  ? '#a0a0a0'
                  : tier === 'Gold'
                    ? '#d4af37'
                    : tier === 'Platinum'
                      ? '#6b5b95'
                      : '#4fd2c2'
            }
          >
            {t(('tier.name.' + tier.toLowerCase()) as never)}
          </Tag>
        )
      },
      {
        title: t('admin.tierMinSpend'),
        dataIndex: 'minSpend',
        key: 'minSpend',
        align: 'right',
        render: (val: number) => formatCurrency(val)
      },
      {
        title: t('admin.tierDiscountPercent'),
        dataIndex: 'discountPercent',
        key: 'discountPercent',
        align: 'right',
        render: (val: number) => `${val}%`
      },
      {
        title: t('admin.tierFreeShipping'),
        dataIndex: 'freeShipping',
        key: 'freeShipping',
        align: 'center',
        render: (val: boolean) =>
          val ? <Tag color="green">✓</Tag> : <Tag>✕</Tag>
      },
      {
        title: t('common.action'),
        key: 'action',
        align: 'center',
        width: 140,
        render: (_, row) => (
          <div className="flex justify-center gap-1">
            <Button icon={<EditOutlined />} onClick={() => onEdit(row)} />
            {row.tier !== 'Bronze' && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(row)}
              />
            )}
          </div>
        )
      }
    ],
    [onEdit, onDelete, t, current, pageSize]
  )

  return (
    <Table<TierConfig>
      rowKey="id"
      bordered
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      size="small"
      pagination={{
        current,
        pageSize,
        total: totalCount,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) =>
          `${t('common.total')}: ${total} ${t('admin.tierConfig').toLowerCase()}`,
        onChange: onPaginationChange
      }}
      locale={{ emptyText: <Empty description={t('common.noData')} /> }}
      scroll={{ x: 'max-content' }}
    />
  )
}
