import { useQuery } from '@tanstack/react-query'
import { Button, Card, Divider, Rate, Select, Skeleton } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getProductReviews } from '@/api/reviews-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import ReviewList from '@/components/reviews/ReviewList'
import { useTranslation } from 'react-i18next'

const LOAD_MORE_COUNT = 4

export default function ProductReviewsSection({
  productId,
  productName
}: {
  productId: string
  productName: string
}) {
  const { t } = useTranslation()
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

  const prevFilterRef = useRef([starFilter, sortOrder])

  useEffect(() => {
    if (
      prevFilterRef.current[0] !== starFilter ||
      prevFilterRef.current[1] !== sortOrder
    ) {
      prevFilterRef.current = [starFilter, sortOrder]
      setLoadedCount(LOAD_MORE_COUNT)
    }
  }, [starFilter, sortOrder])

  return (
    <Card className="p-6 mt-8 rounded-lg card">
      <div className="mb-4 text-xl font-semibold">
        {t('review.reviews')} {productName}
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-[220px_minmax(260px,1fr)_minmax(240px,1fr)]">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-end leading-none gap-1">
            <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">
              {averageRating.toFixed(1)}
            </span>
            <span className="pb-1 text-3xl text-slate-400 dark:text-slate-500">
              /5
            </span>
          </div>
          <Rate
            disabled
            allowHalf
            value={averageRating}
            className="text-amber-500"
          />
          <span className="text-sm text-slate-500">
            {t('review.countReview', { count: totalReviews })}
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
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {t('review.countReview', { count: row.count })}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
            {t('review.experienceReviews')}
          </div>
          {topExperienceTags.length > 0 ? (
            <div className="space-y-2">
              {topExperienceTags.map((item) => (
                <div
                  key={item.tag}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item.tag}
                  </span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {t('review.countReview', { count: item.count })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              {t('review.noReviews')}
            </div>
          )}
        </div>
      </div>
      <Divider />
      {!reviewsQuery.isLoading ? (
        <div className="flex flex-col mb-4 gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-300">
              {t('review.filterByRating')}
            </span>
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
                        ? 'border-blue-500! bg-blue-50! text-blue-600! dark:border-blue-400! dark:bg-blue-900/20! dark:text-blue-400!'
                        : 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {rating === 'all'
                      ? t('common.all')
                      : `${rating} ${t('review.stars')}`}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-300">
              {t('review.sortBy')}:
            </span>
            <Select<'low-to-high' | 'high-to-low'>
              value={sortOrder}
              onChange={(value) => setSortOrder(value)}
              className="w-40"
              options={[
                { value: 'high-to-low', label: t('review.highToLow') },
                { value: 'low-to-high', label: t('review.lowToHigh') }
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
                {t('review.moreReviews')}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  )
}
