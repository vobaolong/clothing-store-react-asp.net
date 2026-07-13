import { useMemo, useState, useCallback } from 'react'
import { Table, Tag, Tooltip, Button, Empty } from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import type { TablePaginationConfig, ColumnsType } from 'antd/es/table'
import type { Customer } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { CustomerTier } from '@/enums'
import { useTranslation } from 'react-i18next'

const TIER_COLORS: Record<string, string> = {
  [CustomerTier.BRONZE]: '#cd7f32',
  [CustomerTier.SILVER]: '#a0a0a0',
  [CustomerTier.GOLD]: '#d4af37',
  [CustomerTier.PLATINUM]: '#6b5b95',
  [CustomerTier.DIAMOND]: '#4fd2c2'
}

interface AdminCustomerTableProps {
  dataSource: Customer[]
  loading: boolean
  onLockOpen: (customer: Customer) => void
  onUnlock: (customer: Customer) => void
}

export default function AdminCustomerTable({
  dataSource,
  loading,
  onLockOpen,
  onUnlock
}: AdminCustomerTableProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const handleTableChange = useCallback((pag: TablePaginationConfig) => {
    setPage(pag.current ?? 1)
    setPageSize(pag.pageSize ?? 10)
  }, [])

  const columns = useMemo<ColumnsType<Customer>>(
    () => [
      {
        title: '#',
        key: 'index',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => (page - 1) * pageSize + index + 1
      },
      {
        title: t('admin.columnId'),
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => id.slice(0, 8).toUpperCase()
      },
      { title: t('admin.columnName'), dataIndex: 'name', key: 'name' },
      { title: t('admin.columnPhone'), dataIndex: 'phone', key: 'phone' },
      { title: t('auth.email'), dataIndex: 'email', key: 'email' },
      {
        title: t('admin.tier'),
        dataIndex: 'tier',
        key: 'tier',
        align: 'center',
        width: 100,
        render: (tier: string) => (
          <Tag color={TIER_COLORS[tier] ?? '#cd7f32'}>
            {getVietnameseLabel(tier)}
          </Tag>
        )
      },
      {
        title: t('admin.totalSpent'),
        dataIndex: 'totalSpent',
        key: 'totalSpent',
        align: 'right',
        render: (val: number) => formatCurrency(val)
      },
      {
        title: t('common.status'),
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (status: Customer['status']) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {getVietnameseLabel(status)}
          </Tag>
        )
      },
      {
        title: t('admin.columnDate'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value, 'dateOnly')
      },
      {
        title: t('common.action'),
        key: 'action',
        align: 'center',
        width: 100,
        fixed: 'right',
        render: (_, row) =>
          row.status === 'active' ? (
            <Tooltip title={t('admin.tooltipLockAccount')}>
              <Button danger size="small" onClick={() => onLockOpen(row)}>
                <LockOutlined />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title={t('admin.tooltipUnlockAccount')}>
              <Button size="small" onClick={() => onUnlock(row)}>
                <UnlockOutlined />
              </Button>
            </Tooltip>
          )
      }
    ],
    [onLockOpen, onUnlock, page, pageSize, t]
  )

  return (
    <Table<Customer>
      rowKey="id"
      bordered
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      size="small"
      scroll={{ x: 'max-content' }}
      onChange={handleTableChange}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) =>
          `${t('common.total')} ${total} ${t('admin.customers').toLowerCase()}`
      }}
      locale={{ emptyText: <Empty description={t('common.noData')} /> }}
    />
  )
}
