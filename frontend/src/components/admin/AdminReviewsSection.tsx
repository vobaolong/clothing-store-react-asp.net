import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

import {
  getAdminReviews,
  deleteAdminReview
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import AdminReviewsToolbar from '@/components/admin/AdminReviewsToolbar'
import AdminReviewsTable from '@/components/admin/AdminReviewsTable'
import AdminReviewsSelectionActions from '@/components/admin/AdminReviewSelectionActions'

export default function AdminReviewsSection() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null)

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.adminReviews,
    queryFn: getAdminReviews
  })

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteAdminReview(id)
        toast.success('Đánh giá đã được xóa thành công')
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminReviews })
        setSelectedRowKeys((prev) => prev.filter((key) => key !== id))
      } catch {
        toast.error('Xóa đánh giá thất bại')
      }
    },
    [queryClient]
  )



  const filteredData = useMemo(() => {
    const list = data ?? []
    const needle = search.trim().toLowerCase()
    const startOfDay = dateRange?.[0]?.startOf('day')
    const endOfDay = dateRange?.[1]?.endOf('day')

    return list.filter((review) => {
      const searchMatch =
        !needle ||
        [
          review.userFullName,
          review.userEmail,
          review.productName,
          review.comment
        ].some((field) => field?.toLowerCase().includes(needle)) ||
        review.tags?.some((t) => t.toLowerCase().includes(needle))

      const createdAt = dayjs(review.createdAt)
      const dateMatch =
        !startOfDay ||
        !endOfDay ||
        ((createdAt.isAfter(startOfDay) || createdAt.isSame(startOfDay)) &&
          (createdAt.isBefore(endOfDay) || createdAt.isSame(endOfDay)))

      const ratingMatch =
        ratingFilter === 'all' || review.rating === parseInt(ratingFilter, 10)

      return searchMatch && dateMatch && ratingMatch
    })
  }, [data, search, dateRange, ratingFilter])

  const hasFilters =
    search !== '' || ratingFilter !== 'all' || dateRange !== null

  const handleResetFilters = () => {
    setSearch('')
    setRatingFilter('all')
    setDateRange(null)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  return (
    <div className='space-y-4'>
      {selectedRowKeys.length > 0 && (
        <AdminReviewsSelectionActions
          selectedIds={selectedRowKeys.map(String)}
          onClearSelection={() => setSelectedRowKeys([])}
          onRefresh={async () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminReviews })
          }}
        />
      )}

      <AdminReviewsToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPagination((prev) => ({ ...prev, current: 1 }))
        }}
        ratingFilter={ratingFilter}
        onRatingFilterChange={(value) => {
          setRatingFilter(value)
          setPagination((prev) => ({ ...prev, current: 1 }))
        }}
        dateRange={dateRange}
        onDateRangeChange={(dates) => {
          setDateRange(dates)
          setPagination((prev) => ({ ...prev, current: 1 }))
        }}
        hasFilters={hasFilters}
        onResetFilters={handleResetFilters}
      />

      <AdminReviewsTable
        dataSource={filteredData}
        loading={isLoading}
        current={pagination.current}
        pageSize={pagination.pageSize}
        totalCount={filteredData.length}
        onPaginationChange={(page, pageSize) =>
          setPagination({ current: page, pageSize })
        }
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onDelete={handleDelete}
      />
    </div>
  )
}
