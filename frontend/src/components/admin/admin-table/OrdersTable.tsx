import { Button, Empty, Table, Tag, Tooltip } from 'antd'
import { formatCurrency, formatDate } from '@/utils/format'
import { ORDER_STATUS_COLORS } from '@/constants/order-status.constant'
import { EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { TablePaginationConfig, ColumnsType } from 'antd/es/table'
import type { OrderOverview } from '@/types'
import { lp } from '@/utils/language-path'

type OrdersTableProps = {
  data: OrderOverview[]
  loading?: boolean
}

const ORDER_STATUS_KEYS = {
  Pending: 'order.pending',
  Confirmed: 'order.confirmed',
  Shipping: 'order.shipping',
  Delivered: 'order.delivered',
  Cancelled: 'order.cancelled'
} as const

export default function OrdersTable({
  data,
  loading = false
}: OrdersTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const orderStatusLabel = useCallback(
    (status: OrderOverview['status']) => {
      const key = ORDER_STATUS_KEYS[status as keyof typeof ORDER_STATUS_KEYS]
      return key ? t(key) : status
    },
    [t]
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const handleTableChange = useCallback((pag: TablePaginationConfig) => {
    setPage(pag.current ?? 1)
    setPageSize(pag.pageSize ?? 10)
  }, [])

  const columns = useMemo<ColumnsType<OrderOverview>>(
    () => [
      {
        title: '#',
        key: 'stt',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => (page - 1) * pageSize + index + 1
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        render: (value: string) => value.slice(0, 8).toUpperCase()
      },
      {
        title: t('order.customerEmail'),
        dataIndex: 'customerEmail',
        key: 'customerEmail'
      },
      {
        title: t('order.orderTotal'),
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: t('order.orderStatus'),
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (value: OrderOverview['status']) => (
          <Tag color={ORDER_STATUS_COLORS[value] ?? 'default'}>
            {orderStatusLabel(value)}
          </Tag>
        )
      },
      {
        title: t('order.orderDate'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: t('common.action'),
        key: 'action',
        align: 'center',
        fixed: 'right',
        render: (record) => (
          <Tooltip title={t('common.view')}>
            <Button
              onClick={() => navigate(lp(`/admin/orders/${record.id}`))}
              icon={<EyeOutlined />}
            />
          </Tooltip>
        )
      }
    ],
    [navigate, orderStatusLabel, page, pageSize, t]
  )

  return (
    <Table<OrderOverview>
      rowKey="id"
      loading={loading}
      bordered
      size="small"
      dataSource={data}
      columns={columns}
      locale={{ emptyText: <Empty description={t('order.noOrders')} /> }}
      pagination={{ current: page, pageSize: 10, hideOnSinglePage: true }}
      onChange={handleTableChange}
      scroll={{ x: 'max-content' }}
    />
  )
}
