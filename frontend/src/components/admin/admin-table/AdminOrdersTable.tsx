import { useMemo, useState, useCallback } from 'react'
import { Table, Tag, Select, Button, Tooltip, Empty } from 'antd'
import type { TablePaginationConfig } from 'antd/es/table'
import { EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ADMIN_ORDER_STATUS_FILTER_OPTIONS } from '@/options/admin-filter.options'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { canUpdateToStatus } from '@/utils/order-status-transition'
import { formatCurrency, formatDate } from '@/utils/format'
import { OrderStatus } from '@/enums'
import { STATUS_COLORS } from '@/constants/labels.constant'
import type { AdminOrder } from '@/types'

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
        title: 'Mã đơn',
        dataIndex: 'id',
        key: 'id',
        render: (value: string) => value.slice(0, 8).toUpperCase()
      },
      {
        title: 'Người dùng',
        dataIndex: 'userEmail',
        key: 'userEmail'
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Thanh toán',
        dataIndex: 'paymentStatus',
        key: 'paymentStatus',
        align: 'center',
        render: (value: string) => (
          <Tag variant="outlined" color={STATUS_COLORS[value]}>
            {getVietnameseLabel(value)}
          </Tag>
        )
      },
      {
        title: 'Trạng thái',
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
            options={ADMIN_ORDER_STATUS_FILTER_OPTIONS.map((option) => ({
              ...option,
              label: getVietnameseLabel(option.value),
              disabled: !canUpdateToStatus(row.status, option.value)
            }))}
            onChange={(value) => onUpdateStatus(row, value)}
          />
        )
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        className: 'truncate',
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Cập nhật lúc',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        className: 'truncate',
        sorter: (a, b) =>
          new Date(a.updatedAt ?? a.createdAt).getTime() -
          new Date(b.updatedAt ?? b.createdAt).getTime(),
        render: (value?: string) => (value ? formatDate(value) : '-')
      },
      {
        title: 'Thao tác',
        key: 'action',
        align: 'center',
        fixed: 'right',
        render: (_, row) => (
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} onClick={() => onView(row)} />
          </Tooltip>
        )
      }
    ],
    [onUpdateStatus, onView, page, pageSize]
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
        showTotal: (total) => `Tổng ${total} đơn hàng`
      }}
      locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
    />
  )
}
