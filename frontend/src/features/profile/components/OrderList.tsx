import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Table,
  Tag,
  Tabs,
  Tooltip
} from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getMyOrders } from '@/api/orders-api'
import { formatCurrency, formatDate } from '@/utils/format'
import { FilterStatus, ORDER_FILTER_STATUSES } from '@/enums'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import type { MyOrder } from '@/types'

const matchesSearch = (needle: string, order: MyOrder) => {
  const normalized = needle.trim().toLowerCase()
  if (!normalized) return true
  return [
    order.id,
    order.status,
    order.paymentStatus,
    String(order.totalAmount),
    String(order.itemCount)
  ].some((value) => value.toLowerCase().includes(normalized))
}

function buildColumns(
  navigate: ReturnType<typeof useNavigate>
): ColumnsType<MyOrder> {
  return [
    {
      title: 'STT',
      align: 'center',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      align: 'center',
      render: (_, row) => row.id.slice(0, 8).toUpperCase()
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'totalAmount',
      align: 'right',
      render: (_, row) => formatCurrency(row.totalAmount)
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      align: 'center',
      render: (_, row) => (
        <Tag>{getVietnameseStatusLabel(row.paymentStatus)}</Tag>
      )
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      align: 'center',
      render: (_, row) => <Tag>{getVietnameseStatusLabel(row.status)}</Tag>
    },
    {
      title: 'Ngày mua',
      dataIndex: 'createdAt',
      align: 'right',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (_, row) => formatDate(row.createdAt)
    },
    {
      title: 'Xem',
      align: 'center',
      render: (_, row) => (
        <Tooltip title='Xem chi tiết'>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${row.id}`)}
          />
        </Tooltip>
      )
    }
  ]
}

export default function OrderList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<string>(FilterStatus.ALL)

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myOrders(),
    queryFn: ({ queryKey }) => getMyOrders(queryKey[1])
  })

  const orders = useMemo(() => data?.orders ?? [], [data])

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (activeStatus === FilterStatus.ALL ||
            order.status === activeStatus) &&
          matchesSearch(search, order)
      ),
    [orders, search, activeStatus]
  )

  const tabItems = useMemo(
    () =>
      ORDER_FILTER_STATUSES.map((status) => {
        const count =
          status === FilterStatus.ALL
            ? orders.length
            : orders.filter((o) => o.status === status).length
        return {
          key: status,
          label: (
            <div className='flex items-center justify-center gap-2'>
              <span className='truncate'>
                {status === FilterStatus.ALL
                  ? 'Tất cả'
                  : getVietnameseStatusLabel(status)}
              </span>
              <Badge count={count} />
            </div>
          )
        }
      }),
    [orders]
  )

  const emptyText =
    orders.length === 0
      ? 'Bạn chưa đặt đơn hàng nào.'
      : 'Không tìm thấy đơn hàng nào khớp với từ khóa tìm kiếm của bạn.'

  const columns = useMemo(() => buildColumns(navigate), [navigate])

  return (
    <Card>
      <div className='space-y-3'>
        <Input.Search
          allowClear
          placeholder='Tìm kiếm theo ID đơn hàng, trạng thái, thanh toán...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tabs
          activeKey={activeStatus}
          onChange={setActiveStatus}
          items={tabItems}
          className='order-status-tabs w-full'
          tabBarStyle={{ marginBottom: 0 }}
        />
      </div>
      <Table
        className='mt-4'
        rowKey='id'
        loading={isLoading}
        dataSource={filteredOrders}
        columns={columns}
        locale={{ emptyText: <Empty description={emptyText} /> }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  )
}
