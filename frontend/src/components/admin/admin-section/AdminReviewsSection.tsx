import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { getAdminReviews, deleteAdminReview } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import AdminReviewsToolbar from '@/components/admin/admin-toolbar/AdminReviewsToolbar'
import AdminReviewsTable from '@/components/admin/admin-table/AdminReviewsTable'
import AdminReviewsSelectionActions from '@/components/admin/admin-selection-action/AdminReviewSelectionActions'
import isBetween from 'dayjs/plugin/isBetween'
import { useFilteredReviews } from '@/hooks/useFilteredReviews'
import type { DateRangeType } from '@/types'
dayjs.extend(isBetween)

export default function AdminReviewsSection() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRangeType>(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.adminReviews,
    queryFn: getAdminReviews
  })

  const filteredData = useFilteredReviews({
    data,
    search,
    dateRange,
    ratingFilter
  })

  const { mutateAsync: deleteReviewAsync } = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: (_, id) => {
      toast.success('Đánh giá đã được xóa thành công')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminReviews })
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id))
    },
    onError: () => {
      toast.error('Xóa đánh giá thất bại')
    }
  })

  const handleDelete = useCallback(
    (id: string) => {
      return deleteReviewAsync(id)
    },
    [deleteReviewAsync]
  )

  const hasFilters =
    search !== '' || ratingFilter !== 'all' || dateRange !== null

  const handleFilterChange = useCallback((updater: () => void) => {
    updater()
    setPagination((prev) => ({ ...prev, current: 1 }))
  }, [])

  const handleResetFilters = () => {
    setSearch('')
    setRatingFilter('all')
    setDateRange(null)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  return (
    <div className="space-y-4">
      {selectedRowKeys.length > 0 && (
        <AdminReviewsSelectionActions
          selectedIds={selectedRowKeys.map(String)}
          onClearSelection={() => setSelectedRowKeys([])}
          onRefresh={async () => {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.adminReviews
            })
          }}
        />
      )}

      <AdminReviewsToolbar
        search={search}
        onSearchChange={(value) => handleFilterChange(() => setSearch(value))}
        ratingFilter={ratingFilter}
        onRatingFilterChange={(value) =>
          handleFilterChange(() => setRatingFilter(value))
        }
        dateRange={dateRange}
        onDateRangeChange={(dates) =>
          handleFilterChange(() => setDateRange(dates))
        }
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
