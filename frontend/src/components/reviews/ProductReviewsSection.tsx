import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Divider, Modal, Rate, Select, Skeleton } from 'antd'
import { useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createReview,
  deleteReview,
  getProductReviews
} from '@/api/reviews-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getAuthToken } from '@/state/auth-session'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReviewList from '@/components/reviews/ReviewList'

export default function ProductReviewsSection({
  productId,
  productName
}: {
  productId: string
  productName: string
}) {
  const queryClient = useQueryClient()
  const reviewFormRef = useRef<HTMLDivElement>(null)
  const isAuthenticated = Boolean(getAuthToken())
  const [starFilter, setStarFilter] = useState<number | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low'>(
    'high-to-low'
  )

  const reviewsQuery = useQuery({
    queryKey: QUERY_KEYS.productReviews(productId),
    queryFn: () => getProductReviews(productId)
  })

  const createMutation = useMutation({
    mutationFn: (values: {
      rating: number
      comment?: string
      tags?: string[]
    }) =>
      createReview({
        productId,
        rating: values.rating,
        comment: values.comment,
        tags: values.tags
      }),
    onSuccess: async () => {
      toast.success('Review saved')
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productReviews(productId)
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: async () => {
      toast.success('Review deleted')
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productReviews(productId)
      })
    }
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
    return [...filtered].sort((a, b) =>
      sortOrder === 'low-to-high' ? a.rating - b.rating : b.rating - a.rating
    )
  }, [summary?.reviews, starFilter, sortOrder])

  const handleSubmit = async (values: {
    rating: number
    comment?: string
    tags?: string[]
  }) => {
    await createMutation.mutateAsync({
      rating: values.rating,
      comment: values.comment,
      tags: values.tags
    })
  }

  return (
    <Card className='p-6 mt-8 bg-white border rounded-lg border-stone-200'>
      <div className='mb-4 text-xl font-semibold'>Đánh giá {productName}</div>
      <div className='mb-6 grid gap-6 lg:grid-cols-[220px_minmax(260px,1fr)_minmax(240px,1fr)]'>
        <div className='flex flex-col items-start gap-1'>
          <div className='flex items-end leading-none gap-1'>
            <span className='text-5xl font-bold text-slate-900'>
              {averageRating.toFixed(1)}
            </span>
            <span className='pb-1 text-3xl text-slate-400'>/5</span>
          </div>
          <Rate
            disabled
            allowHalf
            value={averageRating}
            className='text-amber-500'
          />
          <span className='text-sm text-slate-500'>
            {totalReviews} lượt đánh giá
          </span>
          {summary?.canReview ? (
            <Button
              type='primary'
              className='mt-2 rounded-lg'
              onClick={() =>
                reviewFormRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                })
              }
            >
              Viết đánh giá
            </Button>
          ) : null}
        </div>

        <div className='px-4 space-y-2 border-x border-slate-100'>
          {ratingBreakdown.map((row) => (
            <div
              key={row.rating}
              className='grid grid-cols-[20px_1fr_70px] items-center gap-3'
            >
              <span className='text-sm font-medium text-slate-600'>
                {row.rating}
              </span>
              <div className='h-2 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full bg-red-500 rounded-full'
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className='text-xs text-slate-500'>
                {row.count} đánh giá
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className='mb-2 text-lg font-semibold text-slate-800'>
            Đánh giá theo trải nghiệm
          </div>
          {topExperienceTags.length > 0 ? (
            <div className='space-y-2'>
              {topExperienceTags.map((item) => (
                <div
                  key={item.tag}
                  className='flex items-center justify-between gap-3'
                >
                  <span className='text-sm text-slate-700'>{item.tag}</span>
                  <span className='text-sm font-medium text-slate-600'>
                    ({item.count} đánh giá)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-sm text-slate-400'>
              Chưa có dữ liệu trải nghiệm.
            </div>
          )}
        </div>
      </div>
      <Divider />
      {!reviewsQuery.isLoading ? (
        <div className='flex flex-col mb-4 gap-3 md:flex-row md:items-center'>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='text-sm text-slate-500'>Lọc đánh giá theo:</span>
            <div className='flex flex-wrap gap-3'>
              {(['all', 5, 4, 3, 2, 1] as const).map((rating) => {
                const isActive = starFilter === rating
                return (
                  <Button
                    key={rating}
                    type='default'
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
          <div className='flex items-center gap-2'>
            <span className='text-sm text-slate-500'>Sắp xếp:</span>
            <Select<'low-to-high' | 'high-to-low'>
              value={sortOrder}
              onChange={(value) => setSortOrder(value)}
              className='w-40'
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

      {!reviewsQuery.isLoading && summary?.canReview ? (
        <div
          ref={reviewFormRef}
          className='p-4 border rounded-2xl border-slate-200 bg-slate-50'
        >
          <div className='block mb-3 font-medium text-slate-700'>
            Viết đánh giá
          </div>
          <ReviewForm
            loading={createMutation.isPending}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}

      {!reviewsQuery.isLoading && !isAuthenticated ? (
        <div className='p-4 text-sm border border-dashed rounded-2xl border-slate-200 bg-slate-50/70 text-slate-500'>
          Mua hàng để viết đánh giá.
        </div>
      ) : null}

      {!reviewsQuery.isLoading ? (
        <div className='mt-6'>
          <ReviewList
            reviews={visibleReviews}
            onDelete={(review) =>
              Modal.confirm({
                title: 'Xóa đánh giá?',
                content: 'Bạn có chắc chắn muốn xóa đánh giá này không?',
                okText: 'Xóa',
                okButtonProps: { danger: true },
                cancelText: 'Hủy',
                onOk: () => deleteMutation.mutateAsync(review.id)
              })
            }
          />
        </div>
      ) : null}
    </Card>
  )
}
