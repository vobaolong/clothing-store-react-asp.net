import { useCallback, useState } from 'react'
import { Input, Select, DatePicker, Tabs, Button } from 'antd'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

import {
  getAdminOrders,
  updateAdminOrderStatus,
  bulkUpdateAdminOrdersStatus
} from '@/api/admin-api'
import { getApiErrorMessage } from '@/utils/error-handler'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { useAdmin } from '@/context/AdminContext'
import { OrderStatus } from '@/enums'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import {
  ADMIN_ORDER_STATUS_FILTER_OPTIONS,
  ADMIN_PAYMENT_STATUS_FILTER_OPTIONS
} from '@/options/admin-filter.options'
import type { AdminOrder } from '@/types'

import { useFilteredOrders } from '@/hooks/useFilteredOrders'
import { useOrdersTabs } from '@/hooks/useOrdersTabs'
import { lp } from '@/utils/language-path'
import OrdersTable from '@/components/admin/admin-table/AdminOrdersTable'
import BulkUpdateOrdersModal from '@/components/admin/admin-modal/BulkUpdateOrdersModal'
import { AdminRefreshButtonAction } from '../AdminRefreshButtonAction'

export default function AdminOrdersSection() {
  const { filters, refresh, navigate } = useAdmin()
  const { orderStatusFilter, setOrderStatusFilter } = filters

  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: ADMIN_FILTER_ALL_VALUE,
    payment: ADMIN_FILTER_ALL_VALUE,
    dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
  })

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState<string>(
    OrderStatus.CONFIRMED
  )

  const ordersQuery = useQuery({
    queryKey: QUERY_KEYS.adminOrders(orderStatusFilter),
    queryFn: () => getAdminOrders(orderStatusFilter)
  })

  const data = ordersQuery.data?.orders
  const counts = ordersQuery.data?.counts

  const filteredData = useFilteredOrders({
    data,
    search: localFilters.search,
    status: localFilters.status,
    payment: localFilters.payment,
    dateRange: localFilters.dateRange
  })

  const tabItems = useOrdersTabs(counts)

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAdminOrderStatus(id, { status }),
    onSuccess: async () => {
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      await refresh()
    },
    onError: () => toast.error('Cập nhật trạng thái thất bại')
  })

  const { mutateAsync: bulkUpdateStatusMutation, isPending: isBulkUpdating } =
    useMutation({
      mutationFn: bulkUpdateAdminOrdersStatus,
      onSuccess: async () => {
        toast.success('Cập nhật trạng thái hàng loạt thành công')
        setSelectedRowKeys([])
        setIsBulkModalOpen(false)
        await refresh()
      },
      onError: (error: unknown) => {
        toast.error(
          getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật trạng thái')
        )
      }
    })

  const onView = useCallback(
    (order: AdminOrder) => {
      navigate(lp(`/admin/orders/${order.id}`))
    },
    [navigate]
  )

  const onUpdateStatus = useCallback(
    (order: AdminOrder, status: string) => {
      updateStatus({ id: order.id, status })
    },
    [updateStatus]
  )

  const handleBulkUpdateConfirm = async () => {
    if (!selectedRowKeys.length || !bulkUpdateStatus) return
    await bulkUpdateStatusMutation({
      orderIds: selectedRowKeys as string[],
      status: bulkUpdateStatus
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          activeKey={orderStatusFilter}
          onChange={setOrderStatusFilter}
          items={tabItems}
          className="w-full order-status-tabs"
          tabBarStyle={{ marginBottom: 0 }}
        />
        <div className="flex gap-2 items-center">
          {selectedRowKeys.length > 0 && (
            <Button type="primary" onClick={() => setIsBulkModalOpen(true)}>
              Cập nhật trạng thái ({selectedRowKeys.length})
            </Button>
          )}
          <AdminRefreshButtonAction query={ordersQuery} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input.Search
          allowClear
          placeholder="Tìm theo mã đơn hàng, email..."
          value={localFilters.search}
          onChange={(e) =>
            setLocalFilters((p) => ({ ...p, search: e.target.value }))
          }
          onSearch={(val) => setLocalFilters((p) => ({ ...p, search: val }))}
          className="w-full sm:max-w-lg"
        />
        <Select
          value={localFilters.status}
          options={ADMIN_ORDER_STATUS_FILTER_OPTIONS}
          onChange={(val) => setLocalFilters((p) => ({ ...p, status: val }))}
          className="w-44"
        />
        <Select
          value={localFilters.payment}
          options={ADMIN_PAYMENT_STATUS_FILTER_OPTIONS}
          onChange={(val) => setLocalFilters((p) => ({ ...p, payment: val }))}
          className="w-50"
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
          className="w-full sm:w-auto"
        />
      </div>

      <OrdersTable
        dataSource={filteredData}
        loading={ordersQuery.isLoading}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onUpdateStatus={onUpdateStatus}
        onView={onView}
      />

      <BulkUpdateOrdersModal
        open={isBulkModalOpen}
        selectedCount={selectedRowKeys.length}
        statusValue={bulkUpdateStatus}
        isConfirmLoading={isBulkUpdating}
        onCancel={() => !isBulkUpdating && setIsBulkModalOpen(false)}
        onChangeStatus={setBulkUpdateStatus}
        onConfirm={handleBulkUpdateConfirm}
      />
    </div>
  )
}
