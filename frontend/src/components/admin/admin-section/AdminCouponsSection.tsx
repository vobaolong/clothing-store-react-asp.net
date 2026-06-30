import { useCallback, useState } from 'react'
import { Button, Input, Select, FloatButton } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'

import { CouponStatus } from '@/enums'
import type { Coupon } from '@/types'
import { getAdminCoupons, deleteCoupon, updateCoupon } from '@/api/coupons-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { useAdmin } from '@/context/AdminContext'

import { AdminRefreshButtonAction } from '@/components/admin/AdminRefreshButtonAction'
import { useFilteredCoupons } from '@/hooks/useFilteredCoupons'
import AdminCouponsTable from '@/components/admin/admin-table/AdminCouponsTable'
import {
  ADMIN_COUPON_STATUS_FILTER_OPTIONS,
  ADMIN_COUPON_TYPE_FILTER_OPTIONS
} from '@/options'

export default function AdminCouponsSection() {
  const { refresh, confirmDelete, modals, editing, editor } = useAdmin()
  const { clearDirty } = editor

  const couponsQuery = useQuery<Coupon[]>({
    queryKey: QUERY_KEYS.adminCoupons,
    queryFn: () => getAdminCoupons()
  })

  const [filters, setFilters] = useState({
    search: '',
    discountType: ADMIN_FILTER_ALL_VALUE,
    status: ADMIN_FILTER_ALL_VALUE
  })

  const filteredData = useFilteredCoupons({
    data: couponsQuery.data,
    search: filters.search,
    discountType: filters.discountType,
    status: filters.status
  })

  const { mutateAsync: deleteCouponAsync } = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: async () => {
      toast.success('Đã lưu trữ voucher')
      await refresh()
    }
  })

  const { mutateAsync: updateCouponStatusAsync } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CouponStatus }) =>
      updateCoupon(id, { status }),
    onSuccess: async () => {
      toast.success('Đã cập nhật trạng thái')
      await refresh()
    }
  })

  const onCreate = useCallback(() => {
    editing.setCoupon(null)
    clearDirty('coupon')
    modals.setCoupon(true)
  }, [clearDirty, editing, modals])

  const onEdit = useCallback(
    (coupon: Coupon) => {
      editing.setCoupon(coupon)
      clearDirty('coupon')
      modals.setCoupon(true)
    },
    [clearDirty, editing, modals]
  )

  const onDelete = useCallback(
    async (coupon: Coupon): Promise<void> => {
      confirmDelete('Lưu trữ voucher này?', async () => {
        await deleteCouponAsync(coupon.id)
      })
    },
    [confirmDelete, deleteCouponAsync]
  )

  const onStatusChange = useCallback(
    async (coupon: Coupon, status: CouponStatus): Promise<void> => {
      await updateCouponStatusAsync({ id: coupon.id, status })
    },
    [updateCouponStatusAsync]
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="hidden sm:flex flex-wrap gap-2 justify-end w-full sm:ml-auto sm:w-auto">
          <AdminRefreshButtonAction query={couponsQuery} />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Tạo Voucher
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center mt-3 w-full">
          <Input.Search
            allowClear
            placeholder="Tìm theo mã coupon, số tiền…"
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
            className="w-full sm:max-w-sm"
          />
          <Select
            value={filters.discountType}
            onChange={(val) => setFilters((p) => ({ ...p, discountType: val }))}
            className="min-w-36"
            options={ADMIN_COUPON_TYPE_FILTER_OPTIONS}
          />
          <Select
            value={filters.status}
            onChange={(val) => setFilters((p) => ({ ...p, status: val }))}
            className="min-w-36"
            options={ADMIN_COUPON_STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ bottom: 24, right: 24 }}
        icon={<PlusOutlined />}
        className="sm:hidden!"
      >
        <FloatButton
          icon={<PlusOutlined />}
          onClick={onCreate}
          tooltip="Tạo Voucher"
        />
        <FloatButton
          icon={<ReloadOutlined />}
          onClick={() => couponsQuery.refetch()}
          tooltip="Tải lại"
        />
      </FloatButton.Group>

      <AdminCouponsTable
        loading={couponsQuery.isLoading}
        data={filteredData}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </div>
  )
}
