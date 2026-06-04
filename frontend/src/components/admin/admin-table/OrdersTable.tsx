import { Button, Empty, Table, Tag, Tooltip } from 'antd'
import { formatCurrency, formatDate } from '@/utils/format'
import { getOrderStatusLabel, STATUS_COLORS } from '@/constants/labels.constant'
import { EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, useCallback } from 'react'
import type { TablePaginationConfig, ColumnsType } from 'antd/es/table'
import type { OrderOverview } from '@/types'

type OrdersTableProps = {
  data: OrderOverview[]
  loading?: boolean
}

export default function OrdersTable({
  data,
  loading = false
}: OrdersTableProps) {
  const navigate = useNavigate()
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
        title: 'Khách hàng',
        dataIndex: 'customerEmail',
        key: 'customerEmail'
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (value: OrderOverview['status']) => (
          <Tag color={STATUS_COLORS[value] ?? 'default'}>
            {getOrderStatusLabel(value)}
          </Tag>
        )
      },
      {
        title: 'Ngày đặt hàng',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Thao tác',
        key: 'action',
        align: 'center',
        fixed: 'right',
        render: (record) => (
          <Tooltip title="Xem chi tiết">
            <Button
              onClick={() => navigate(`/admin/orders/${record.id}`)}
              icon={<EyeOutlined />}
            />
          </Tooltip>
        )
      }
    ],
    [navigate, page, pageSize]
  )

  return (
    <Table<OrderOverview>
      rowKey="id"
      loading={loading}
      bordered
      size="small"
      dataSource={data}
      columns={columns}
      locale={{ emptyText: <Empty description="Không có đơn hàng nào" /> }}
      pagination={{ current: page, pageSize: 10, hideOnSinglePage: true }}
      onChange={handleTableChange}
      scroll={{ x: 'max-content' }}
    />
  )
}
