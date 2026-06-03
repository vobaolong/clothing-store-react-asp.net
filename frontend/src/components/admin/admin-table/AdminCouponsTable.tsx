import { useMemo } from 'react'
import { Table, Tag, Space, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CouponStatus } from '@/enums'
import type { Coupon } from '@/types'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { formatCurrency, formatDate } from '@/utils/format'
import { formatCouponDiscount } from '@/utils/coupon-discount'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'
import { ADMIN_COUPON_STATUS_FILTER_OPTIONS } from '@/options'

interface AdminCouponsTableProps {
  loading: boolean
  data: Coupon[]
  onEdit: (coupon: Coupon) => void
  onDelete: (coupon: Coupon) => Promise<void>
  onStatusChange: (coupon: Coupon, status: CouponStatus) => Promise<void>
}

export default function AdminCouponsTable({
  loading,
  data,
  onEdit,
  onDelete,
  onStatusChange
}: AdminCouponsTableProps) {
  const columns = useMemo<ColumnsType<Coupon>>(
    () => [
      {
        title: '#',
        key: 'index',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1
      },
      {
        title: 'Mã',
        dataIndex: 'code',
        key: 'code',
        width: 200,
        render: (value: string) => (
          <Tag variant="outlined" color="blue" className="font-mono">
            {value}
          </Tag>
        )
      },
      {
        title: 'Giảm giá',
        dataIndex: 'discountAmount',
        key: 'discountAmount',
        align: 'right',
        render: (_, row) => formatCouponDiscount(row)
      },
      {
        title: 'Loại',
        dataIndex: 'discountType',
        key: 'discountType',
        render: (value: string) => getVietnameseStatusLabel(value)
      },
      {
        title: 'Đơn tối thiểu',
        dataIndex: 'minOrderSubtotal',
        key: 'minOrderSubtotal',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Lượt dùng',
        dataIndex: 'usedCount',
        key: 'usedCount',
        render: (value: number, row) => `${value} / ${row.maxUsage}`
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'expiresAt',
        key: 'expiresAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (_, row) => (
          <Select
            value={row.status}
            size="small"
            style={{ width: 110 }}
            onChange={(newStatus) => onStatusChange(row, newStatus)}
            options={ADMIN_COUPON_STATUS_FILTER_OPTIONS.filter(
              (o: { value: string }) => o.value !== ADMIN_FILTER_ALL_VALUE
            )}
          />
        )
      },
      {
        title: 'Thao tác',
        key: 'action',
        fixed: 'right',
        align: 'center',
        width: 100,
        render: (_, row) => (
          <Space>
            <AdminUpsertButtonActions
              row={row}
              onEdit={onEdit}
              onDelete={onDelete}
              deleteTitle="Lưu trữ"
            />
          </Space>
        )
      }
    ],
    [onStatusChange, onEdit, onDelete]
  )

  return (
    <Table<Coupon>
      rowKey="id"
      bordered
      loading={loading}
      dataSource={data}
      columns={columns}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `Tổng ${total} vouchers`
      }}
    />
  )
}
