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
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import {
  ORDER_FILTER_ALL_LABEL,
  ORDER_FILTER_ALL_VALUE
} from '@/constants/order.constant'
import { getMyOrders } from '@/api/orders-api'
import { formatCurrency, formatDate } from '@/utils/format'
import { ORDER_FILTER_STATUSES } from '@/options/order.options'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { STATUS_COLORS } from '@/constants/labels.constant'
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

export default function OrderList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<string>(
    ORDER_FILTER_ALL_VALUE
  )

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myOrders(),
    queryFn: ({ queryKey }) => getMyOrders(queryKey[1])
  })

  const orders = useMemo(() => data?.orders ?? [], [data])

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (activeStatus === ORDER_FILTER_ALL_VALUE ||
            order.status === activeStatus) &&
          matchesSearch(search, order)
      ),
    [orders, search, activeStatus]
  )

  const tabItems = useMemo(
    () =>
      ORDER_FILTER_STATUSES.map((status) => {
        const count =
          status === ORDER_FILTER_ALL_VALUE
            ? orders.length
            : orders.filter((o) => o.status === status).length
        return {
          key: status,
          label: (
            <div className="flex gap-2 justify-center items-center">
              <span className="truncate">
                {status === ORDER_FILTER_ALL_VALUE
                  ? ORDER_FILTER_ALL_LABEL
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

  const columns = useMemo<ColumnsType<MyOrder>>(
    () => [
      {
        title: '#',
        key: 'no',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_: unknown, row: MyOrder) => (
          <span className="font-semibold">
            {filteredOrders.indexOf(row) + 1}
          </span>
        )
      },
      {
        title: 'Mã đơn hàng',
        dataIndex: 'id',
        width: 150,
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
        width: 120,
        render: (_, row) => (
          <Tag variant="outlined" color={STATUS_COLORS[row.paymentStatus]}>
            {getVietnameseStatusLabel(row.paymentStatus)}
          </Tag>
        )
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        width: 120,
        render: (_, row) => (
          <Tag variant="outlined" color={STATUS_COLORS[row.status]}>
            {getVietnameseStatusLabel(row.status)}
          </Tag>
        )
      },
      {
        title: 'Ngày mua',
        dataIndex: 'createdAt',
        width: 150,
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        defaultSortOrder: 'descend',
        render: (_, row) => formatDate(row.createdAt)
      },
      {
        title: 'Thao tác',
        align: 'center',
        width: 100,
        fixed: 'right',
        render: (_, row) => (
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/orders/${row.id}`)}
            />
          </Tooltip>
        )
      }
    ],
    [filteredOrders, navigate]
  )

  return (
    <Card>
      <div className="space-y-3">
        <Input.Search
          allowClear
          placeholder="Tìm kiếm theo ID đơn hàng, trạng thái, thanh toán..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tabs
          activeKey={activeStatus}
          onChange={setActiveStatus}
          items={tabItems}
          className="w-full order-status-tabs"
          tabBarStyle={{ marginBottom: 0 }}
        />
      </div>
      <Table
        className="mt-4"
        rowKey="id"
        loading={isLoading}
        dataSource={filteredOrders}
        columns={columns}
        locale={{ emptyText: <Empty description={emptyText} /> }}
        scroll={{ x: 'max-content' }}
        bordered
      />
    </Card>
  )
}
