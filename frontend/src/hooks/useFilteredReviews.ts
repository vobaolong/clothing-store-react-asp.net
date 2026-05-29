import dayjs from 'dayjs'
import { useMemo } from 'react'
import isBetween from 'dayjs/plugin/isBetween'
import type { Review } from '@/types'

dayjs.extend(isBetween)

interface UseFilteredReviewsProps {
  data: Review[] | undefined
  search: string
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ratingFilter: string
}

export function useFilteredReviews({
  data,
  search,
  dateRange,
  ratingFilter
}: UseFilteredReviewsProps) {
  return useMemo(() => {
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
        review.tags?.some((t: string) => t.toLowerCase().includes(needle))

      const createdAt = dayjs(review.createdAt)
      const dateMatch =
        !startOfDay ||
        !endOfDay ||
        createdAt.isBetween(startOfDay, endOfDay, 'day', '[]')

      const ratingMatch =
        ratingFilter === 'all' || review.rating === parseInt(ratingFilter, 10)

      return searchMatch && dateMatch && ratingMatch
    })
  }, [data, search, dateRange, ratingFilter])
}
