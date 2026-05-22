import { Empty, Table, Tag } from 'antd'
import { formatCurrency, formatDate } from '@/utils/format'
import { getOrderStatusLabel, STATUS_COLORS, type OrderOverview } from '@/types'

type OrdersTableProps = {
  data: OrderOverview[]
  loading?: boolean
}

export default function OrdersTable({
  data,
  loading = false
}: OrdersTableProps) {
  return (
    <Table<OrderOverview>
      rowKey='id'
      loading={loading}
      bordered
      size='small'
      dataSource={data}
      locale={{ emptyText: <Empty description='Không có đơn hàng nào' /> }}
      pagination={{ pageSize: 6, hideOnSinglePage: true }}
      scroll={{ x: 'max-content' }}
      columns={[
        {
          title: '#',
          dataIndex: 'stt',
          key: 'stt',
          align: 'center',
          width: 60,
          render: (_, __, index: number) => index + 1
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
        }
      ]}
    />
  )
}
