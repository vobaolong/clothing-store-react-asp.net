import { Avatar, Button, Empty, Rate, Tag } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import type { ProductReview } from '@/types'
import { formatDate } from '@/utils/format'

type ReviewListProps = {
  reviews: ProductReview[]
  onEdit?: (review: ProductReview) => void
  onDelete?: (review: ProductReview) => void
}

export default function ReviewList({
  reviews,
  onEdit,
  onDelete
}: ReviewListProps) {
  const getInitial = (name: string) => {
    const normalized = name.trim()
    if (!normalized) return 'U'
    return normalized.charAt(0).toUpperCase()
  }

  const isDeleteAllowed = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime()
    const currentTime = new Date().getTime()
    return currentTime - createdTime <= 24 * 60 * 60 * 1000
  }

  if (!reviews.length) {
    return (
      <Empty
        description='Chưa có đánh giá nào cho sản phẩm này'
        className='py-8'
      />
    )
  }

  return (
    <div className='space-y-4'>
      {reviews.map((review) => (
        <div
          key={review.id}
          className='p-4 bg-white border rounded-2xl border-slate-200'
        >
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4'>
            <div className='flex w-full sm:w-44 sm:shrink-0 items-center gap-3'>
              <Avatar className='bg-slate-200! text-slate-700 font-semibold'>
                {getInitial(review.userName)}
              </Avatar>
              <span className='font-bold text-[15px] text-slate-900'>
                {review.userName}
              </span>
            </div>

            <div className='min-w-0 flex-1 w-full'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <Rate
                    disabled
                    size='small'
                    value={review.rating}
                    className='mt-1 text-xs text-amber-500'
                  />
                  {(review.variantSize || review.variantColor) && (
                    <div className='flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-slate-500'>
                      {review.variantSize && (
                        <span>
                          <span className='text-slate-400'>Kích thước:</span>{' '}
                          {review.variantSize}
                        </span>
                      )}
                      {review.variantColor && (
                        <span>
                          <span className='text-slate-400'>Màu sắc:</span>{' '}
                          {review.variantColor}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {review.isMine && (
                  <div className='flex items-center gap-1'>
                    {onEdit && (
                      <Button
                        type='text'
                        size='small'
                        icon={<EditOutlined className='text-slate-400' />}
                        onClick={() => onEdit(review)}
                      />
                    )}
                    {onDelete && isDeleteAllowed(review.createdAt) && (
                      <Button
                        danger
                        type='text'
                        size='small'
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(review)}
                      />
                    )}
                  </div>
                )}
              </div>

              {review.comment && (
                <p className='mt-3 text-[14px] leading-relaxed text-slate-800 font-medium'>
                  {review.comment}
                </p>
              )}

              {review.tags && review.tags.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-4'>
                  {review.tags.map((tag) => (
                    <Tag
                      key={tag}
                      className='m-0 rounded-full border-slate-200 bg-white px-3 py-0.5 text-xs text-slate-600 shadow-xs'
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}

              <div className='mt-3 text-right text-xs text-slate-400'>
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
