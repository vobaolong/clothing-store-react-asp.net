import { useCallback, useMemo, useState } from 'react'
import {
  Button,
  DatePicker,
  Empty,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Tooltip
} from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Customer } from '@/types'
import { formatDate } from '@/utils/format'
import dayjs from 'dayjs'

import { useQuery } from '@tanstack/react-query'
import {
  getAdminCustomers,
  lockAdminCustomer,
  unlockAdminCustomer
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/features/admin/context/AdminContext'
import toast from 'react-hot-toast'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'

function buildColumns(
  onLockCustomer: (c: Customer) => void,
  onUnlockCustomer: (c: Customer) => Promise<void>,
  filteredData: Customer[]
): ColumnsType<Customer> {
  return [
    {
      title: '#',
      dataIndex: 'no',
      align: 'center',
      width: 60,
      fixed: 'left',
      render: (_, row) => filteredData.indexOf(row) + 1
    },
    {
      title: 'ID',
      dataIndex: 'id',
      render: (_, row: Customer) => row.id.slice(0, 8).toUpperCase()
    },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      render: (_, row: Customer) => (
        <Tag color={row.status === 'active' ? 'green' : 'red'}>
          {getVietnameseStatusLabel(row.status)}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (value: string) => formatDate(value, 'dateOnly')
    },
    {
      title: 'Thao tác',
      align: 'center',
      fixed: 'right',
      render: (_, row) =>
        row.status === 'active' ? (
          <Tooltip title='Khóa tài khoản'>
            <Button danger size='small' onClick={() => onLockCustomer(row)}>
              <LockOutlined />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title='Mở khóa tài khoản'>
            <Button size='small' onClick={() => onUnlockCustomer(row)}>
              <UnlockOutlined />
            </Button>
          </Tooltip>
        )
    }
  ]
}

export default function AdminCustomersSection() {
  const { refresh } = useAdmin()

  const customersQuery = useQuery({
    queryKey: QUERY_KEYS.adminCustomers,
    queryFn: getAdminCustomers
  })

  const data = customersQuery.data
  const loading = customersQuery.isLoading

  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined
  >(undefined)
  const [lockState, setLockState] = useState({
    target: null as Customer | null,
    reason: undefined as string | undefined,
    isLocking: false
  })

  const onLock = useCallback(
    async (customer: Customer, reason?: string) => {
      await lockAdminCustomer(customer.id, { reason })
      toast.success('Tài khoản đã bị khóa')
      await refresh()
    },
    [refresh]
  )

  const onUnlock = useCallback(
    async (customer: Customer) => {
      await unlockAdminCustomer(customer.id)
      toast.success('Tài khoản đã được mở khóa')
      await refresh()
    },
    [refresh]
  )

  const onLockOpen = useCallback((customer: Customer) => {
    setLockState((prev) => ({
      ...prev,
      target: customer,
      reason: undefined
    }))
  }, [])

  const filteredData = useMemo(() => {
    const list = data ?? []
    const needle = search.trim().toLowerCase()
    const startOfDay = dateRange?.[0]?.startOf('day')
    const endOfDay = dateRange?.[1]?.endOf('day')

    return list.filter((c) => {
      const searchMatch =
        !needle ||
        [c.id, c.name, c.phone, c.email]
          .join(' ')
          .toLowerCase()
          .includes(needle)

      const createdAt = dayjs(c.createdAt)
      const dateMatch =
        (!startOfDay ||
          createdAt.isAfter(startOfDay) ||
          createdAt.isSame(startOfDay)) &&
        (!endOfDay ||
          createdAt.isBefore(endOfDay) ||
          createdAt.isSame(endOfDay))

      return searchMatch && dateMatch
    })
  }, [data, search, dateRange])

  const columns = useMemo(
    () => buildColumns(onLockOpen, onUnlock, filteredData),
    [onLockOpen, onUnlock, filteredData]
  )

  const handleLockOk = async () => {
    if (!lockState.target) return
    setLockState((prev) => ({ ...prev, isLocking: true }))
    try {
      await onLock(lockState.target, lockState.reason?.trim() || undefined)
      setLockState((prev) => ({
        ...prev,
        target: null,
        reason: undefined
      }))
    } finally {
      setLockState((prev) => ({ ...prev, isLocking: false }))
    }
  }

  return (
    <div className='space-y-3!'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Input.Search
          allowClear
          className='w-96!'
          placeholder='Tìm kiếm theo id, tên, số điện thoại hoặc email'
          value={search}
          onChange={({ target: { value } }) => setSearch(value)}
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) =>
            setDateRange(dates ? [dates[0], dates[1]] : undefined)
          }
          placeholder={['Từ ngày', 'Đến ngày']}
          className='w-full sm:w-auto'
        />
      </div>

      <Table
        rowKey='id'
        bordered
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} khách hàng`
        }}
        locale={{ emptyText: <Empty description='Không có khách hàng' /> }}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title='Khóa tài khoản'
        destroyOnHidden
        open={Boolean(lockState.target)}
        okText='Xác nhận khóa'
        confirmLoading={lockState.isLocking}
        onCancel={() =>
          !lockState.isLocking &&
          setLockState((prev) => ({ ...prev, target: null }))
        }
        onOk={handleLockOk}
      >
        <p className='mb-2 text-sm text-slate-600'>
          Email sẽ được gửi đến khách hàng với nội dung dựa trên lý do đã chọn.
        </p>
        <label className='mb-1 block text-sm font-medium' htmlFor='lock-reason'>
          Lý do khóa tài khoản
        </label>
        <Select
          className='w-full'
          id='lock-reason'
          placeholder='Chọn lý do'
          value={lockState.reason}
          onChange={(val) => setLockState((prev) => ({ ...prev, reason: val }))}
          options={[
            { value: 'Vi phạm điều khoản', label: 'Vi phạm điều khoản' },
            { value: 'Hoạt động bất thường', label: 'Hoạt động bất thường' },
            {
              value: 'Theo yêu cầu người dùng',
              label: 'Theo yêu cầu người dùng'
            },
            { value: 'Khác', label: 'Khác' }
          ]}
        />
      </Modal>
    </div>
  )
}
