import { Button, DatePicker, Input, Select } from 'antd'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { RATING_FILTER_OPTIONS } from '@/constants/review.constant'

interface AdminReviewsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  ratingFilter: string
  onRatingFilterChange: (value: string) => void
  dateRange: [Dayjs | null, Dayjs | null] | null
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void
  hasFilters: boolean
  onResetFilters: () => void
}

export default function AdminReviewsToolbar({
  search,
  onSearchChange,
  ratingFilter,
  onRatingFilterChange,
  dateRange,
  onDateRangeChange,
  hasFilters,
  onResetFilters
}: AdminReviewsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center max-w-4xl">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Tìm theo người dùng, sản phẩm, bình luận, tag..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:max-w-md"
        />
        <Select
          value={ratingFilter}
          onChange={onRatingFilterChange}
          options={RATING_FILTER_OPTIONS}
          className="w-full sm:w-44"
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) =>
            onDateRangeChange(dates ? [dates[0], dates[1]] : null)
          }
          placeholder={['Từ ngày', 'Đến ngày']}
          className="w-full sm:w-auto"
          format="DD/MM/YYYY"
        />
        {hasFilters && (
          <Button
            icon={<ReloadOutlined />}
            onClick={onResetFilters}
            className="w-full sm:w-auto border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400"
          >
            Đặt lại
          </Button>
        )}
      </div>
    </div>
  )
}
