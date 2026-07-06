import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Table, Tag, Space, Select } from 'antd'
import type { TablePaginationConfig } from 'antd/es/table'
import type { ColumnsType } from 'antd/es/table'
import { CouponStatus } from '@/enums'
import type { Coupon } from '@/types'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { formatCurrency, formatDate } from '@/utils/format'
import { formatCouponDiscount } from '@/utils/coupon-discount'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'
import { useAdminFilterOptions } from '@/options'

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
  const { t } = useTranslation()
  const { couponStatus } = useAdminFilterOptions()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const handleTableChange = useCallback((pag: TablePaginationConfig) => {
    setPage(pag.current ?? 1)
    setPageSize(pag.pageSize ?? 10)
  }, [])

  const columns = useMemo<ColumnsType<Coupon>>(
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
        title: t('common.code'),
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
        title: t('admin.columnDiscount'),
        dataIndex: 'discountAmount',
        key: 'discountAmount',
        align: 'right',
        render: (_, row) => formatCouponDiscount(row)
      },
      {
        title: t('admin.columnType'),
        dataIndex: 'discountType',
        key: 'discountType',
        render: (value: string) => getVietnameseLabel(value)
      },
      {
        title: t('admin.columnMinOrder'),
        dataIndex: 'minOrderSubtotal',
        key: 'minOrderSubtotal',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: t('admin.columnUsage'),
        dataIndex: 'usedCount',
        key: 'usedCount',
        align: 'center',
        render: (value: number, row) => `${value} / ${row.maxUsage}`
      },
      {
        title: t('admin.columnExpiry'),
        dataIndex: 'expiresAt',
        key: 'expiresAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: t('common.status'),
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (_, row) => (
          <Select
            value={row.status}
            size="small"
            style={{ width: 110 }}
            onChange={(newStatus) => onStatusChange(row, newStatus)}
            options={couponStatus.filter(
              (o: { value: string }) => o.value !== ADMIN_FILTER_ALL_VALUE
            )}
          />
        )
      },
      {
        title: t('common.action'),
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
              deleteTitle={t('coupon.archive')}
            />
          </Space>
        )
      }
    ],
    [couponStatus, onStatusChange, onEdit, onDelete, page, pageSize, t]
  )

  return (
    <Table<Coupon>
      rowKey="id"
      bordered
      loading={loading}
      dataSource={data}
      columns={columns}
      size="small"
      scroll={{ x: 'max-content' }}
      onChange={handleTableChange}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) =>
          `${t('common.total')} ${total} ${t('coupon.coupons').toLowerCase()}`
      }}
    />
  )
}
