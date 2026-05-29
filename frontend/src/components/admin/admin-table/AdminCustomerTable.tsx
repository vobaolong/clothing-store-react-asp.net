import { useMemo } from 'react'
import { Table, Tag, Tooltip, Button, Empty } from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Customer } from '@/types'
import { formatDate } from '@/utils/format'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'

interface AdminCustomerTableProps {
  dataSource: Customer[]
  loading: boolean
  onLockOpen: (customer: Customer) => void
  onUnlock: (customer: Customer) => void
}

export default function AdminCustomerTable({
  dataSource,
  loading,
  onLockOpen,
  onUnlock
}: AdminCustomerTableProps) {
  const columns = useMemo<ColumnsType<Customer>>(
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
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => id.slice(0, 8).toUpperCase()
      },
      { title: 'Tên', dataIndex: 'name', key: 'name' },
      { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (status: Customer['status']) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {getVietnameseStatusLabel(status)}
          </Tag>
        )
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDate(value, 'dateOnly')
      },
      {
        title: 'Thao tác',
        key: 'action',
        align: 'center',
        width: 100,
        fixed: 'right',
        render: (_, row) =>
          row.status === 'active' ? (
            <Tooltip title="Khóa tài khoản">
              <Button danger size="small" onClick={() => onLockOpen(row)}>
                <LockOutlined />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Mở khóa tài khoản">
              <Button size="small" onClick={() => onUnlock(row)}>
                <UnlockOutlined />
              </Button>
            </Tooltip>
          )
      }
    ],
    [onLockOpen, onUnlock]
  )

  return (
    <Table<Customer>
      rowKey="id"
      bordered
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `Tổng ${total} khách hàng`
      }}
      locale={{ emptyText: <Empty description="Không có khách hàng" /> }}
    />
  )
}
