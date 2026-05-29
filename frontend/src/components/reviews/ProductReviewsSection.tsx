import { useQuery } from '@tanstack/react-query'
import { Button, Card, Divider, Rate, Select, Skeleton } from 'antd'
import { useMemo, useRef, useState } from 'react'
import { getProductReviews } from '@/api/reviews-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import ReviewList from '@/components/reviews/ReviewList'

const LOAD_MORE_COUNT = 4

export default function ProductReviewsSection({
  productId,
  productName
}: {
  productId: string
  productName: string
}) {
  const [starFilter, setStarFilter] = useState<number | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low'>(
    'high-to-low'
  )
  const [loadedCount, setLoadedCount] = useState(LOAD_MORE_COUNT)

  const reviewsQuery = useQuery({
    queryKey: QUERY_KEYS.productReviews(productId),
    queryFn: () => getProductReviews(productId)
  })

  const summary = reviewsQuery.data
  const totalReviews = summary?.totalCount ?? 0
  const averageRating = summary?.averageRating ?? 0

  const ratingBreakdown = useMemo(() => {
    const counts = new Map<number, number>([
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0]
    ])
    for (const review of summary?.reviews ?? []) {
      const rating = Math.max(1, Math.min(5, Math.round(review.rating)))
      counts.set(rating, (counts.get(rating) ?? 0) + 1)
    }
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = counts.get(rating) ?? 0
      return {
        rating,
        count,
        percent: totalReviews > 0 ? (count / totalReviews) * 100 : 0
      }
    })
  }, [summary?.reviews, totalReviews])

  const topExperienceTags = useMemo(() => {
    const tagCount = new Map<string, number>()
    for (const review of summary?.reviews ?? []) {
      for (const tag of review.tags ?? []) {
        const normalized = tag.trim()
        if (!normalized) continue
        tagCount.set(normalized, (tagCount.get(normalized) ?? 0) + 1)
      }
    }
    return [...tagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }))
  }, [summary?.reviews])

  const visibleReviews = useMemo(() => {
    const reviews = summary?.reviews ?? []
    const filtered =
      starFilter === 'all'
        ? reviews
        : reviews.filter((review) => review.rating === starFilter)
    const sorted = [...filtered].sort((a, b) =>
      sortOrder === 'low-to-high' ? a.rating - b.rating : b.rating - a.rating
    )
    return sorted.slice(0, loadedCount)
  }, [summary?.reviews, starFilter, sortOrder, loadedCount])

  const hasMore = (summary?.reviews?.length ?? 0) > loadedCount

  // Reset loadedCount when filters change
  const prevFilterRef = useRef([starFilter, sortOrder])
  if (
    prevFilterRef.current[0] !== starFilter ||
    prevFilterRef.current[1] !== sortOrder
  ) {
    prevFilterRef.current = [starFilter, sortOrder]
    setLoadedCount(LOAD_MORE_COUNT)
  }

  return (
    <Card className="p-6 mt-8 bg-white rounded-lg border border-stone-200">
      <div className="mb-4 text-xl font-semibold">Đánh giá {productName}</div>
      <div className="mb-6 grid gap-6 lg:grid-cols-[220px_minmax(260px,1fr)_minmax(240px,1fr)]">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-1 items-end leading-none">
            <span className="text-5xl font-bold text-slate-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="pb-1 text-3xl text-slate-400">/5</span>
          </div>
          <Rate
            disabled
            allowHalf
            value={averageRating}
            className="text-amber-500"
          />
          <span className="text-sm text-slate-500">
            {totalReviews} lượt đánh giá
          </span>
        </div>

        <div className="px-4 space-y-2 border-x border-slate-100">
          {ratingBreakdown.map((row) => (
            <div
              key={row.rating}
              className="grid grid-cols-[20px_1fr_70px] items-center gap-3"
            >
              <span className="text-sm font-medium text-slate-600">
                {row.rating}
              </span>
              <div className="overflow-hidden h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {row.count} đánh giá
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-2 text-lg font-semibold text-slate-800">
            Đánh giá theo trải nghiệm
          </div>
          {topExperienceTags.length > 0 ? (
            <div className="space-y-2">
              {topExperienceTags.map((item) => (
                <div
                  key={item.tag}
                  className="flex gap-3 justify-between items-center"
                >
                  <span className="text-sm text-slate-700">{item.tag}</span>
                  <span className="text-sm font-medium text-slate-600">
                    ({item.count} đánh giá)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              Chưa có dữ liệu trải nghiệm.
            </div>
          )}
        </div>
      </div>
      <Divider />
      {!reviewsQuery.isLoading ? (
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-slate-500">Lọc đánh giá theo:</span>
            <div className="flex flex-wrap gap-3">
              {(['all', 5, 4, 3, 2, 1] as const).map((rating) => {
                const isActive = starFilter === rating
                return (
                  <Button
                    key={rating}
                    type="default"
                    onClick={() => setStarFilter(rating)}
                    className={`rounded-full! border px-5 py-2 text-[20px] leading-none transition-colors ${
                      isActive
                        ? 'border-blue-500! bg-blue-50! text-blue-600!'
                        : 'border-slate-300 bg-slate-100 text-slate-800'
                    }`}
                  >
                    {rating === 'all' ? 'Tất cả' : `${rating} sao`}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-slate-500">Sắp xếp:</span>
            <Select<'low-to-high' | 'high-to-low'>
              value={sortOrder}
              onChange={(value) => setSortOrder(value)}
              className="w-40"
              options={[
                { value: 'high-to-low', label: 'Cao đến thấp' },
                { value: 'low-to-high', label: 'Thấp đến cao' }
              ]}
            />
          </div>
        </div>
      ) : null}

      {reviewsQuery.isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : null}

      {!reviewsQuery.isLoading ? (
        <div className="mt-6">
          <ReviewList reviews={visibleReviews} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                size="large"
                onClick={() => setLoadedCount((c) => c + LOAD_MORE_COUNT)}
              >
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  )
}
