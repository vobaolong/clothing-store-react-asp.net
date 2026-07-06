import { useMemo, useState, useCallback } from 'react'
import { Table, Tag, Select, Button, Tooltip, Empty } from 'antd'
import type { TablePaginationConfig } from 'antd/es/table'
import { EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAdminFilterOptions } from '@/options/admin-filter.options'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { canUpdateToStatus } from '@/utils/order-status-transition'
import { formatCurrency, formatDate } from '@/utils/format'
import { OrderStatus } from '@/enums'
import { ORDER_STATUS_COLORS } from '@/constants/order-status.constant'
import type { AdminOrder } from '@/types'
import { useTranslation } from 'react-i18next'

interface AdminOrdersTableProps {
  dataSource: AdminOrder[]
  loading: boolean
  selectedRowKeys: React.Key[]
  onSelectionChange: (keys: React.Key[]) => void
  onUpdateStatus: (order: AdminOrder, status: string) => void
  onView: (order: AdminOrder) => void
}

export default function AdminOrdersTable({
  dataSource,
  loading,
  selectedRowKeys,
  onSelectionChange,
  onUpdateStatus,
  onView
}: AdminOrdersTableProps) {
  const { t } = useTranslation()
  const { orderStatus } = useAdminFilterOptions()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const handleTableChange = useCallback((pag: TablePaginationConfig) => {
    setPage(pag.current ?? 1)
    setPageSize(pag.pageSize ?? 10)
  }, [])

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: onSelectionChange,
      getCheckboxProps: (record: AdminOrder) => ({
        disabled:
          record.status === OrderStatus.DELIVERED ||
          record.status === OrderStatus.CANCELLED
      })
    }),
    [selectedRowKeys, onSelectionChange]
  )

  const columns = useMemo<ColumnsType<AdminOrder>>(
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
        title: t('admin.columnOrderCode'),
        dataIndex: 'id',
        key: 'id',
        render: (value: string) => value.slice(0, 8).toUpperCase()
      },
      {
        title: t('admin.columnUser'),
        dataIndex: 'userEmail',
        key: 'userEmail'
      },
      {
        title: t('order.orderTotal'),
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: t('admin.columnPayment'),
        dataIndex: 'paymentStatus',
        key: 'paymentStatus',
        align: 'center',
        render: (value: string) => (
          <Tag variant="outlined" color={ORDER_STATUS_COLORS[value]}>
            {getVietnameseLabel(value)}
          </Tag>
        )
      },
      {
        title: t('order.status'),
        key: 'status',
        align: 'center',
        render: (_, row) => (
          <Select
            value={row.status}
            style={{ width: 140 }}
            disabled={
              row.status === OrderStatus.DELIVERED ||
              row.status === OrderStatus.CANCELLED
            }
            options={orderStatus.map(
              (option: { value: string; label: string }) => ({
                ...option,
                label: getVietnameseLabel(option.value),
                disabled: !canUpdateToStatus(row.status, option.value)
              })
            )}
            onChange={(value) => onUpdateStatus(row, value)}
          />
        )
      },
      {
        title: t('common.createdAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        className: 'truncate',
        sorter: (a, b) =>
          new Date(a.updatedAt ?? a.createdAt).getTime() -
          new Date(b.updatedAt ?? b.createdAt).getTime(),
        render: (value?: string) => (value ? formatDate(value) : '-')
      },
      {
        title: t('common.action'),
        key: 'action',
        align: 'center',
        fixed: 'right',
        render: (_, row) => (
          <Tooltip title={t('admin.tooltipViewDetail')}>
            <Button icon={<EyeOutlined />} onClick={() => onView(row)} />
          </Tooltip>
        )
      }
    ],
    [onUpdateStatus, onView, orderStatus, page, pageSize, t]
  )

  return (
    <Table
      rowKey="id"
      bordered
      loading={loading}
      dataSource={dataSource}
      rowSelection={rowSelection}
      columns={columns}
      size="small"
      scroll={{ x: 'max-content' }}
      onChange={handleTableChange}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) =>
          t('common.total') + ` ${total} ` + t('order.order').toLowerCase()
      }}
      locale={{ emptyText: <Empty description={t('common.noData')} /> }}
    />
  )
}
