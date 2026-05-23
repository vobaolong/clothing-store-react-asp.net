import { EyeOutlined } from '@ant-design/icons'
import {
  Badge,
  Button,
  DatePicker,
  Empty,
  Input,
  Select,
  Table,
  Tabs,
  Tag,
  Tooltip
} from 'antd'
import { useCallback, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import {
  ADMIN_FILTER_ALL_VALUE,
  ADMIN_ORDER_STATUS_FILTER_OPTIONS,
  ADMIN_PAYMENT_STATUS_FILTER_OPTIONS
} from '@/constants/admin-filter.constant'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { canUpdateToStatus } from '@/utils/order-status-transition'
import type { AdminOrder } from '@/types'
import { AdminQueryRefreshButton } from '@/features/admin/components/admin-query-refresh-button'
import { OrderStatus } from '@/enums'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'
import { formatCurrency, formatDate } from '@/utils/format'
import toast from 'react-hot-toast'

import { useQuery } from '@tanstack/react-query'
import {
  getAdminOrders,
  updateAdminOrderStatus,
  bulkUpdateAdminOrdersStatus,
  getAdminApiErrorMessage
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/features/admin/context/AdminContext'
import { Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'

export default function AdminOrdersSection() {
  const { filters, refresh, navigate } = useAdmin()
  const { orderStatusFilter, setOrderStatusFilter } = filters

  const ordersQuery = useQuery({
    queryKey: QUERY_KEYS.adminOrders(orderStatusFilter),
    queryFn: () => getAdminOrders(orderStatusFilter)
  })

  const data = ordersQuery.data?.orders
  const counts = ordersQuery.data?.counts
  const loading = ordersQuery.isLoading

  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: ADMIN_FILTER_ALL_VALUE,
    payment: ADMIN_FILTER_ALL_VALUE,
    dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
  })

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState<string>(
    OrderStatus.CONFIRMED
  )
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
    getCheckboxProps: (record: AdminOrder) => ({
      disabled:
        record.status === OrderStatus.DELIVERED ||
        record.status === OrderStatus.CANCELLED
    })
  }

  const bulkUpdateOptions = useMemo(
    () =>
      ADMIN_ORDER_STATUS_FILTER_OPTIONS.filter(
        (opt) => opt.value !== ADMIN_FILTER_ALL_VALUE
      ).map((opt) => ({
        ...opt,
        label: getVietnameseStatusLabel(opt.value)
      })),
    []
  )

  const handleBulkUpdate = useCallback(async () => {
    if (!selectedRowKeys.length || !bulkUpdateStatus) return
    setIsBulkUpdating(true)
    try {
      await bulkUpdateAdminOrdersStatus({
        orderIds: selectedRowKeys as string[],
        status: bulkUpdateStatus
      })
      toast.success('Cập nhật trạng thái hàng loạt thành công')
      setSelectedRowKeys([])
      setIsBulkUpdateModalOpen(false)
      await refresh()
    } catch (error: unknown) {
      toast.error(
        getAdminApiErrorMessage(error) ||
          'Có lỗi xảy ra khi cập nhật trạng thái'
      )
    } finally {
      setIsBulkUpdating(false)
    }
  }, [selectedRowKeys, bulkUpdateStatus, refresh])

  const onView = useCallback(
    (order: AdminOrder) => navigate(`/admin/orders/${order.id}`),
    [navigate]
  )

  const onUpdateStatus = useCallback(
    async (order: AdminOrder, status: string) => {
      await updateAdminOrderStatus(order.id, { status })
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      await refresh()
    },
    [refresh]
  )

  const filteredData = useMemo(() => {
    const list = data ?? []
    const needle = adminSearchNeedle(localFilters.search)
    const startOfDay = localFilters.dateRange?.[0]?.startOf('day')
    const endOfDay = localFilters.dateRange?.[1]?.endOf('day')
    return list.filter((o) => {
      const statusMatch =
        localFilters.status === ADMIN_FILTER_ALL_VALUE ||
        o.status === localFilters.status
      const paymentMatch =
        localFilters.payment === ADMIN_FILTER_ALL_VALUE ||
        o.paymentStatus === localFilters.payment
      const createdAt = dayjs(o.createdAt)
      const createdAtMatch =
        (!startOfDay ||
          createdAt.isAfter(startOfDay) ||
          createdAt.isSame(startOfDay)) &&
        (!endOfDay ||
          createdAt.isBefore(endOfDay) ||
          createdAt.isSame(endOfDay))
      const searchMatch =
        !needle ||
        adminRowMatches(
          needle,
          o.id,
          o.userEmail,
          o.status,
          o.paymentStatus,
          getVietnameseStatusLabel(o.status),
          getVietnameseStatusLabel(o.paymentStatus),
          String(o.totalAmount),
          String(o.itemCount ?? '')
        )
      return statusMatch && paymentMatch && createdAtMatch && searchMatch
    })
  }, [data, localFilters])

  const tabItems = useMemo(() => {
    const list = counts ?? []
    return [
      {
        key: ADMIN_FILTER_ALL_VALUE,
        label: (
          <Badge count={list.reduce((acc, curr) => acc + curr.count, 0)}>
            <span className='pr-5'>Tất cả</span>
          </Badge>
        )
      },
      ...ADMIN_ORDER_STATUS_FILTER_OPTIONS.filter(
        (opt) => opt.value !== ADMIN_FILTER_ALL_VALUE
      ).map((opt) => ({
        key: opt.value,
        label: (
          <Badge count={list.find((c) => c.status === opt.value)?.count || 0}>
            <span className='pr-5'>{opt.label}</span>
          </Badge>
        )
      }))
    ]
  }, [counts])

  const columns: ColumnsType<AdminOrder> = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'no',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_: unknown, row: AdminOrder) => filteredData.indexOf(row) + 1
      },
      {
        title: 'Mã đơn',
        dataIndex: 'id',
        render: (value: string) => value.slice(0, 8).toUpperCase()
      },
      { title: 'Người dùng', dataIndex: 'userEmail' },
      {
        title: 'Tổng tiền',
        align: 'right',
        dataIndex: 'totalAmount',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Thanh toán',
        align: 'center',
        dataIndex: 'paymentStatus',
        render: (value: string) => <Tag>{getVietnameseStatusLabel(value)}</Tag>
      },
      {
        title: 'Trạng thái',
        align: 'center',
        render: (_: unknown, row: AdminOrder) => (
          <Select
            value={row.status}
            style={{ width: 140 }}
            disabled={
              row.status === OrderStatus.DELIVERED ||
              row.status === OrderStatus.CANCELLED
            }
            options={ADMIN_ORDER_STATUS_FILTER_OPTIONS.map((option) => ({
              ...option,
              label: getVietnameseStatusLabel(option.value),
              disabled: !canUpdateToStatus(row.status, option.value)
            }))}
            onChange={(value) => onUpdateStatus(row, value)}
          />
        )
      },
      {
        title: 'Ngày tạo',
        className: 'truncate',
        sorter: (a: AdminOrder, b: AdminOrder) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        dataIndex: 'createdAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Cập nhật lúc',
        className: 'truncate',
        sorter: (a: AdminOrder, b: AdminOrder) =>
          new Date(a.updatedAt ?? a.createdAt).getTime() -
          new Date(b.updatedAt ?? b.createdAt).getTime(),
        dataIndex: 'updatedAt',
        render: (value: string | undefined) => (value ? formatDate(value) : '-')
      },
      {
        title: 'Thao tác',
        align: 'center',
        fixed: 'right',
        render: (_: unknown, row: AdminOrder) => (
          <Tooltip title='Xem chi tiết'>
            <Button icon={<EyeOutlined />} onClick={() => onView(row)} />
          </Tooltip>
        )
      }
    ],
    [onUpdateStatus, onView, filteredData]
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <Tabs
          activeKey={orderStatusFilter}
          onChange={setOrderStatusFilter}
          items={tabItems}
          className='w-full order-status-tabs'
          tabBarStyle={{ marginBottom: 0 }}
        />
        <div className='flex items-center gap-2'>
          {selectedRowKeys.length > 0 && (
            <Button
              type='primary'
              onClick={() => setIsBulkUpdateModalOpen(true)}
            >
              Cập nhật trạng thái ({selectedRowKeys.length})
            </Button>
          )}
          <AdminQueryRefreshButton query={ordersQuery} />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Input.Search
          allowClear
          placeholder='Tìm theo mã đơn hàng, email...'
          value={localFilters.search}
          onChange={(e) =>
            setLocalFilters((p) => ({ ...p, search: e.target.value }))
          }
          onSearch={(val) => setLocalFilters((p) => ({ ...p, search: val }))}
          className='w-full sm:max-w-lg'
        />
        <Select
          value={localFilters.status}
          options={ADMIN_ORDER_STATUS_FILTER_OPTIONS}
          onChange={(val) => setLocalFilters((p) => ({ ...p, status: val }))}
          className='w-44'
        />
        <Select
          value={localFilters.payment}
          options={ADMIN_PAYMENT_STATUS_FILTER_OPTIONS}
          onChange={(val) => setLocalFilters((p) => ({ ...p, payment: val }))}
          className='w-50'
        />
        <DatePicker.RangePicker
          value={localFilters.dateRange}
          onChange={(dates) =>
            setLocalFilters((p) => ({
              ...p,
              dateRange: dates ? [dates[0], dates[1]] : [null, null]
            }))
          }
          placeholder={['Từ ngày', 'Đến ngày']}
          className='w-full sm:w-auto'
        />
      </div>

      <Table<AdminOrder>
        rowKey='id'
        bordered
        loading={loading}
        dataSource={filteredData}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} đơn hàng`
        }}
        locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
        columns={columns}
      />

      <Modal
        title='Cập nhật trạng thái hàng loạt'
        open={isBulkUpdateModalOpen}
        onCancel={() => !isBulkUpdating && setIsBulkUpdateModalOpen(false)}
        confirmLoading={isBulkUpdating}
        onOk={handleBulkUpdate}
        okText='Cập nhật'
        cancelText='Hủy'
      >
        <div className='py-4 space-y-4'>
          <p>
            Bạn đang chọn cập nhật trạng thái cho{' '}
            <strong>{selectedRowKeys.length}</strong> đơn hàng.
            <br />
            <span className='text-sm text-gray-500'>
              Lưu ý: Hệ thống chỉ cập nhật các đơn hàng có thể chuyển sang trạng
              thái mới. Nếu có lỗi, vui lòng kiểm tra lại trạng thái hiện tại
              của đơn hàng.
            </span>
          </p>
          <div>
            <label className='block mb-2 font-medium'>Trạng thái mới:</label>
            <Select
              className='w-full'
              value={bulkUpdateStatus}
              onChange={setBulkUpdateStatus}
              options={bulkUpdateOptions}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
