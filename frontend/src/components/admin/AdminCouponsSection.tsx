import { Button, Input, Select, Table, Tag, Space, FloatButton } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useCallback, useMemo, useState } from 'react'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import {
  ADMIN_COUPON_STATUS_FILTER_OPTIONS,
  ADMIN_COUPON_TYPE_FILTER_OPTIONS
} from '@/constants/admin-coupon.constant'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { CouponStatus } from '@/enums'
import type { Coupon } from '@/types'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'
import { formatCurrency, formatDate } from '@/utils/format'
import { formatCouponDiscount } from '@/utils/coupon-discount'
import { AdminQueryRefreshButton } from '@/components/admin/AdminQueryRefreshButton'
import { AdminTableEditDeleteActions } from '@/components/admin/AdminTableEditDeleteActions'
import type { ColumnsType } from 'antd/es/table'

import { useQuery } from '@tanstack/react-query'
import {
  getAdminCoupons,
  deleteCoupon,
  updateCoupon
} from '@/api/coupons-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/context/admin/AdminContext'
import toast from 'react-hot-toast'

export default function AdminCouponsSection() {
  const { refresh, confirmDelete, modals, editing, editor } = useAdmin()
  const { clearDirty } = editor

  const couponsQuery = useQuery<Coupon[]>({
    queryKey: QUERY_KEYS.adminCoupons,
    queryFn: () => getAdminCoupons()
  })

  const data = couponsQuery.data
  const loading = couponsQuery.isLoading
  const refreshQuery = couponsQuery

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
    (coupon: Coupon) =>
      confirmDelete('Lưu trữ voucher này?', async () => {
        await deleteCoupon(coupon.id)
        toast.success('Đã lưu trữ voucher')
        await refresh()
      }),
    [confirmDelete, refresh]
  )

  const onStatusChange = useCallback(
    async (coupon: Coupon, status: CouponStatus) => {
      await updateCoupon(coupon.id, { status })
      toast.success('Đã cập nhật trạng thái')
      await refresh()
    },
    [refresh]
  )
  const [filters, setFilters] = useState({
    search: '',
    discountType: ADMIN_FILTER_ALL_VALUE,
    status: ADMIN_FILTER_ALL_VALUE
  })

  const filteredData = useMemo(() => {
    const needle = adminSearchNeedle(filters.search)
    const list = data ?? []
    return list.filter(
      (c: Coupon) =>
        (filters.discountType === ADMIN_FILTER_ALL_VALUE ||
          c.discountType === filters.discountType) &&
        (filters.status === ADMIN_FILTER_ALL_VALUE ||
          c.status === filters.status) &&
        (!needle ||
          adminRowMatches(
            needle,
            c.code,
            c.id,
            String(c.discountAmount),
            String(c.minOrderSubtotal)
          ))
    )
  }, [data, filters])

  const columns: ColumnsType<Coupon> = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'no',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_: unknown, row: Coupon) => filteredData.indexOf(row) + 1
      },
      {
        title: 'Mã',
        dataIndex: 'code',
        width: 200,
        render: (value: string) => (
          <Tag variant='outlined' color='blue' className='font-mono'>
            {value}
          </Tag>
        )
      },
      {
        title: 'Giảm giá',
        dataIndex: 'discountAmount',
        align: 'right',
        render: (_: unknown, row: Coupon) => formatCouponDiscount(row)
      },
      {
        title: 'Loại',
        dataIndex: 'discountType',
        render: (value: string) => getVietnameseStatusLabel(value)
      },
      {
        title: 'Đơn tối thiểu',
        dataIndex: 'minOrderSubtotal',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Lượt dùng',
        dataIndex: 'usedCount',
        render: (value: number, row: Coupon) => `${value} / ${row.maxUsage}`
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'expiresAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render: (_: unknown, row: Coupon) => {
          return (
            <Select
              value={row.status}
              size='small'
              style={{ width: 110 }}
              onChange={(newStatus) => onStatusChange(row, newStatus)}
              options={ADMIN_COUPON_STATUS_FILTER_OPTIONS.filter(
                (o) => o.value !== ADMIN_FILTER_ALL_VALUE
              )}
            />
          )
        }
      },
      {
        title: 'Thao tác',
        fixed: 'right',
        align: 'center',
        render: (row: Coupon) => (
          <Space>
            <AdminTableEditDeleteActions
              row={row}
              onEdit={onEdit}
              onDelete={onDelete}
              deleteTitle='Lưu trữ'
            />
          </Space>
        )
      }
    ],
    [filteredData, onStatusChange, onEdit, onDelete]
  )

  return (
    <div className='space-y-3'>
      <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
        <div className='hidden sm:flex flex-wrap gap-2 justify-end w-full sm:ml-auto sm:w-auto'>
          <AdminQueryRefreshButton query={refreshQuery} />
          <Button type='primary' icon={<PlusOutlined />} onClick={onCreate}>
            Tạo Voucher
          </Button>
        </div>
        <div className='flex flex-wrap gap-3 items-center mt-3 w-full'>
          <Input.Search
            allowClear
            placeholder='Tìm theo mã coupon, số tiền…'
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
            className='w-full sm:max-w-sm'
          />
          <Select
            value={filters.discountType}
            onChange={(val) => setFilters((p) => ({ ...p, discountType: val }))}
            className='min-w-36'
            placeholder='Loại giảm giá'
            options={[...ADMIN_COUPON_TYPE_FILTER_OPTIONS]}
          />
          <Select
            value={filters.status}
            onChange={(val) => setFilters((p) => ({ ...p, status: val }))}
            className='min-w-36'
            placeholder='Trạng thái'
            options={[...ADMIN_COUPON_STATUS_FILTER_OPTIONS]}
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
        <FloatButton icon={<PlusOutlined />} onClick={onCreate} tooltip="Tạo Voucher" />
        <FloatButton icon={<ReloadOutlined />} onClick={() => refreshQuery.refetch()} tooltip="Tải lại" />
      </FloatButton.Group>

      <Table
        rowKey='id'
        bordered
        loading={loading}
        dataSource={filteredData}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} vouchers`
        }}
        columns={columns}
      />
    </div>
  )
}
