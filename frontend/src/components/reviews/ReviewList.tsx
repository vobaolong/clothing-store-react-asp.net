import { Avatar, Empty, Rate, Tag } from 'antd'
import type { ProductReview } from '@/types'
import { formatDate } from '@/utils/format'

export default function ReviewList({ reviews }: { reviews: ProductReview[] }) {
  const getInitial = (name: string) => {
    const normalized = name.trim()
    if (!normalized) return 'U'
    return normalized.charAt(0).toUpperCase()
  }

  if (!reviews.length) {
    return (
      <Empty
        description="Chưa có đánh giá nào cho sản phẩm này"
        className="py-8"
      />
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 bg-white rounded-2xl border border-slate-200"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex gap-3 items-center w-full sm:w-44 sm:shrink-0">
              <Avatar className="bg-slate-200! text-slate-700 font-semibold">
                {getInitial(review.userName)}
              </Avatar>
              <span className="font-bold text-[15px] text-slate-900">
                {review.userName}
              </span>
            </div>

            <div className="flex-1 w-full min-w-0">
              <div>
                <Rate
                  disabled
                  size="small"
                  value={review.rating}
                  className="mt-1 text-xs text-amber-500"
                />
                {(review.variantSize || review.variantColor) && (
                  <div className="flex flex-wrap gap-2 items-center mt-1 text-xs sm:gap-4 text-slate-500">
                    {review.variantSize && (
                      <span>
                        <span className="text-slate-400">Kích thước:</span>{' '}
                        {review.variantSize}
                      </span>
                    )}
                    {review.variantColor && (
                      <span>
                        <span className="text-slate-400">Màu sắc:</span>{' '}
                        {review.variantColor}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {review.comment && (
                <p className="m-0! pt-2! text-sm font-medium leading-relaxed text-slate-800">
                  {review.comment}
                </p>
              )}

              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2!">
                  {review.tags.map((tag) => (
                    <Tag
                      key={tag}
                      className="m-0 rounded-full border-slate-200 bg-white px-3 py-0.5 text-xs text-slate-600 shadow-xs"
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-right text-slate-400">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
