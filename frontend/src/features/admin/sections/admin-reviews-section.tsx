import { useCallback, useMemo, useState } from 'react'
import {
  Button,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Rate,
  Select,
  Table,
  Tooltip
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatDate } from '@/utils/format'
import type { Review } from '@/types'
import { DeleteOutlined } from '@ant-design/icons/lib/icons'
import dayjs from 'dayjs'

const RATING_FILTER_OPTIONS = [
  { label: 'Tất cả đánh giá', value: 'all' },
  { label: '5 sao', value: '5' },
  { label: '4 sao', value: '4' },
  { label: '3 sao', value: '3' },
  { label: '2 sao', value: '2' },
  { label: '1 sao', value: '1' }
]

import { useQuery } from '@tanstack/react-query'
import { getAdminReviews, deleteAdminReview } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/features/admin/context/AdminContext'
import toast from 'react-hot-toast'

function buildColumns(
  onDelete: (review: Review) => void,
  filteredData: Review[]
): ColumnsType<Review> {
  return [
    {
      title: '#',
      dataIndex: 'no',
      align: 'center',
      width: 60,
      fixed: 'left',
      render: (_, row) => filteredData.indexOf(row) + 1
    },
    { title: 'Người dùng', dataIndex: 'userEmail' },
    { title: 'Sản phẩm', dataIndex: 'productName' },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      render: (value: number) => <Rate disabled size='small' value={value} />
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      render: (value: string) => value || '-'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (value: string) => formatDate(value)
    },
    {
      title: 'Thao tác',
      align: 'center',
      fixed: 'right',
      render: (_, row) => (
        <Popconfirm
          title='Bạn có chắc chắn muốn xóa đánh giá này?'
          okText='Xóa'
          cancelText='Hủy'
          onConfirm={() => onDelete(row)}
        >
          <Tooltip title='Xóa'>
            <Button danger size='small' icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      )
    }
  ]
}

export default function AdminReviewsSection() {
  const { refresh } = useAdmin()

  const reviewsQuery = useQuery({
    queryKey: QUERY_KEYS.adminReviews,
    queryFn: getAdminReviews
  })

  const data = reviewsQuery.data
  const loading = reviewsQuery.isLoading

  const onDelete = useCallback(
    async (review: Review) => {
      await deleteAdminReview(review.id)
      toast.success('Đánh giá đã được xóa')
      await refresh()
    },
    [refresh]
  )
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined
  >(undefined)
  const [ratingFilter, setRatingFilter] = useState<string>('all')

  const filteredData = useMemo(() => {
    const list = data ?? []
    const needle = search.trim().toLowerCase()
    const startOfDay = dateRange?.[0]?.startOf('day')
    const endOfDay = dateRange?.[1]?.endOf('day')

    return list.filter((review) => {
      const searchMatch =
        !needle ||
        [review.userName, review.productName, review.comment]
          .join(' ')
          .toLowerCase()
          .includes(needle)

      const createdAt = dayjs(review.createdAt)
      const dateMatch =
        (!startOfDay ||
          createdAt.isAfter(startOfDay) ||
          createdAt.isSame(startOfDay)) &&
        (!endOfDay ||
          createdAt.isBefore(endOfDay) ||
          createdAt.isSame(endOfDay))

      const ratingMatch =
        ratingFilter === 'all' || review.rating === parseInt(ratingFilter, 10)

      return searchMatch && dateMatch && ratingMatch
    })
  }, [data, search, dateRange, ratingFilter])

  const columns: ColumnsType<Review> = useMemo(
    () => buildColumns(onDelete, filteredData),
    [onDelete, filteredData]
  )

  return (
    <div className='space-y-3'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Input.Search
          allowClear
          placeholder='Tìm kiếm theo người dùng, sản phẩm, bình luận...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full sm:max-w-lg'
        />
        <Select
          value={ratingFilter}
          onChange={(val) => setRatingFilter(val)}
          options={RATING_FILTER_OPTIONS}
          className='w-40'
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
        loading={loading}
        bordered
        dataSource={filteredData}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} đánh giá`
        }}
        locale={{ emptyText: <Empty description='Không có đánh giá' /> }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}
