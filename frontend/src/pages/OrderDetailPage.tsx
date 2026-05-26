import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Descriptions, Empty, Modal, Table, Timeline } from 'antd'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getAuthToken } from '@/state/auth-session'
import { cancelMyOrder, getMyOrderDetail } from '@/api/orders-api'
import { formatCurrency, formatDate } from '@/utils/format'
import { OrderStatus } from '@/enums'
import { LeftOutlined } from '@ant-design/icons'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { createReview } from '@/api/reviews-api'
import toast from 'react-hot-toast'
import ReviewForm from '@/components/reviews/ReviewForm'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'

const formatStructuredAddress = (detail: {
  shippingStreet?: string
  shippingWard?: string
  shippingDistrict?: string
  shippingProvince?: string
  shippingAddress?: string
}) => {
  const structured = [
    detail.shippingStreet,
    detail.shippingWard,
    detail.shippingDistrict,
    detail.shippingProvince
  ]
    .filter((x) => Boolean(x && x.trim()))
    .join(', ')
  return structured || detail.shippingAddress || '-'
}

const STEP_COPY: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.CONFIRMED]: 'Đơn hàng đã được xác nhận',
  [OrderStatus.SHIPPING]: 'Đơn hàng đang trên đường vận chuyển',
  [OrderStatus.DELIVERED]: 'Giao hàng thành công',
  [OrderStatus.CANCELLED]: 'Đơn hàng đã bị huỷ'
}

const timelineColorForStatus = (status: OrderStatus) => {
  if (status === OrderStatus.DELIVERED) return 'green'
  if (status === OrderStatus.CANCELLED) return 'red'
  return 'blue'
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const token = getAuthToken()
  const queryClient = useQueryClient()
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.myOrderDetail(id),
    queryFn: () => getMyOrderDetail(String(id)),
    enabled: Boolean(token && id)
  })

  useOrderRealtime(id)
  const detailData = detailQuery.data
  const reviewingItem =
    detailData?.items.find((item) => item.id === reviewingItemId) ?? null
  const createReviewMutation = useMutation({
    mutationFn: (values: {
      rating: number
      comment?: string
      tags?: string[]
    }) =>
      createReview({
        productId: reviewingItem?.productId ?? '',
        orderItemId: reviewingItem?.id,
        rating: values.rating,
        comment: values.comment,
        tags: values.tags
      }),
    onSuccess: async () => {
      toast.success('Đã gửi đánh giá')
      setReviewingItemId(null)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.myOrderDetail(id)
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.productReviews(reviewingItem?.productId)
        })
      ])
    },
    onError: () => {
      toast.error('Không thể gửi đánh giá')
    }
  })
  const canCancelOrder =
    detailData?.status === OrderStatus.PENDING ||
    detailData?.status === OrderStatus.CONFIRMED
  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      if (!id) return
      await cancelMyOrder(id)
    },
    onSuccess: async () => {
      toast.success('Đã hủy đơn hàng')
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.myOrderDetail(id)
        }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myOrders() })
      ])
    },
    onError: () => {
      toast.error('Không thể hủy đơn hàng')
    }
  })

  if (!token) return <Navigate to='/login' replace />

  if (detailQuery.isLoading) return <p>Đang tải&hellip;</p>
  if (!detailQuery.data) return <p>Đơn hàng không tồn tại.</p>
  const detail = detailQuery.data
  const subtotal = detail.items.reduce((sum, item) => sum + item.lineTotal, 0)
  const shippingFee = Math.max(
    detail.totalAmount - subtotal + detail.discountAmount,
    0
  )
  const histories = (detail.statusHistories ?? []).toSorted(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  )
  const seenStep = new Set<OrderStatus>()
  const historySteps = histories
    .filter((h) => h.status !== OrderStatus.PENDING)
    .filter((h) => {
      if (seenStep.has(h.status)) return false
      seenStep.add(h.status)
      return Boolean(STEP_COPY[h.status])
    })
    .map((h) => ({
      status: h.status,
      changedAt: h.changedAt
    }))

  const synthFromStatus = (): {
    status: OrderStatus
    changedAt: string
  } | null => {
    if (
      detail.status === OrderStatus.DELIVERED &&
      !historySteps.some((s) => s.status === OrderStatus.DELIVERED)
    ) {
      return {
        status: OrderStatus.DELIVERED,
        changedAt: detail.updatedAt ?? detail.paidAt ?? detail.createdAt
      }
    }
    if (
      detail.status === OrderStatus.CANCELLED &&
      !historySteps.some((s) => s.status === OrderStatus.CANCELLED)
    ) {
      return {
        status: OrderStatus.CANCELLED,
        changedAt: detail.updatedAt ?? detail.createdAt
      }
    }
    return null
  }

  const synthetic = synthFromStatus()

  const timelineItems = [
    {
      color: 'gray' as const,
      content: (
        <div>
          <div className='font-medium text-slate-900'>Đơn hàng đã được đặt</div>
          <div className='text-sm text-slate-500'>
            {formatDate(detail.createdAt)}
          </div>
        </div>
      )
    },
    ...historySteps.map((step) => ({
      color: timelineColorForStatus(step.status),
      content: (
        <div>
          <div className='font-medium text-slate-900'>
            {STEP_COPY[step.status] ?? step.status}
          </div>
          <div className='text-sm text-slate-500'>
            {formatDate(step.changedAt)}
          </div>
        </div>
      )
    })),
    ...(synthetic
      ? [
          {
            color: timelineColorForStatus(synthetic.status),
            content: (
              <div>
                <div className='font-medium text-slate-900'>
                  {STEP_COPY[synthetic.status] ?? synthetic.status}
                </div>
                <div className='text-sm text-slate-500'>
                  {formatDate(synthetic.changedAt)}
                </div>
              </div>
            )
          }
        ]
      : [])
  ]

  return (
    <div className='space-y-4!'>
      <div className='flex flex-wrap gap-3 items-center'>
        <Link
          to='/profile?tab=orders'
          className='hover:bg-slate-200! p-3 rounded-full'
        >
          <LeftOutlined />
        </Link>
        <h1 className='text-xl font-semibold sm:text-2xl m-0!'>
          Chi tiết đơn hàng
        </h1>
        <div className='flex gap-3 items-center'>
          {canCancelOrder ? (
            <Button
              danger
              loading={cancelOrderMutation.isPending}
              onClick={() =>
                Modal.confirm({
                  title: 'Hủy đơn hàng?',
                  content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
                  okText: 'Hủy đơn',
                  okButtonProps: { danger: true },
                  cancelText: 'Đóng',
                  onOk: () => cancelOrderMutation.mutateAsync()
                })
              }
            >
              Hủy đơn
            </Button>
          ) : null}
        </div>
      </div>
      <Card className='rounded-2xl' title='Thông tin đơn hàng'>
        <Descriptions column={2} bordered size='small'>
          <Descriptions.Item label='Mã đơn hàng'>
            {detail.id.slice(0, 8).toUpperCase()}
          </Descriptions.Item>

          <Descriptions.Item label='Ngày mua'>
            {formatDate(detail.createdAt)}
          </Descriptions.Item>

          <Descriptions.Item label='Trạng thái'>
            {getVietnameseStatusLabel(detail.status)}
          </Descriptions.Item>

          <Descriptions.Item label='Phương thức thanh toán'>
            {detail.paymentMethod}
          </Descriptions.Item>

          <Descriptions.Item label='Trạng thái thanh toán'>
            {getVietnameseStatusLabel(detail.paymentStatus)}
          </Descriptions.Item>

          <Descriptions.Item label='Tên người nhận'>
            {detail.shippingName || '-'}
          </Descriptions.Item>

          <Descriptions.Item label='Số điện thoại người nhận'>
            {detail.shippingPhone || '-'}
          </Descriptions.Item>

          <Descriptions.Item label='Địa chỉ người nhận'>
            {formatStructuredAddress(detail)}
          </Descriptions.Item>

          {detail.note && (
            <Descriptions.Item label='Ghi chú'>{detail.note}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      <Table
        rowKey='id'
        pagination={false}
        dataSource={detail.items}
        bordered
        className='rounded-lg overflow-hidden'
        locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
        columns={[
          {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            render: (_, row) => (
              <Link
                to={`/products/${row.productSlug}`}
                className='flex gap-2 items-center text-black! line-clamp-2 max-w-56'
              >
                <img
                  src={row.imageUrl}
                  alt='Product'
                  className='object-cover rounded size-16'
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
                {row.productName}
              </Link>
            )
          },
          {
            title: 'Phân loại',
            render: (_, row) => `${row.variantColor} / ${row.variantSize}`
          },
          { title: 'Số lượng', dataIndex: 'quantity', align: 'right' },
          {
            title: 'Đơn giá',
            dataIndex: 'unitPrice',
            align: 'right',
            render: (value: number) => formatCurrency(value)
          },
          {
            title: 'Thành tiền',
            dataIndex: 'lineTotal',
            align: 'right',
            render: (value: number) => formatCurrency(value)
          },
          {
            title: 'Đánh giá',
            align: 'center',
            render: (_, row) =>
              row.hasReviewed ? (
                <span className='text-xs font-medium text-emerald-600'>
                  Đã đánh giá
                </span>
              ) : row.canReview ? (
                <Button
                  size='small'
                  className='rounded-lg'
                  onClick={() => setReviewingItemId(row.id)}
                >
                  Đánh giá
                </Button>
              ) : (
                <span className='text-xs text-slate-400'>
                  Chưa thể đánh giá
                </span>
              )
          }
        ]}
      />
      <div className='grid grid-cols-2 gap-4'>
        <Card className='rounded-2xl' title='Trạng thái đơn hàng'>
          <Timeline items={timelineItems} />
        </Card>

        <Card className='rounded-2xl' title='Tổng tiền'>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Thành tiền</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Giảm giá</span>
              <span className='text-emerald-600'>
                {detail.couponCodeSnapshot && (
                  <span className='mr-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded'>
                    {detail.couponCodeSnapshot}
                  </span>
                )}
                -{formatCurrency(detail.discountAmount || 0)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            <div className='flex justify-between pt-2 mt-2 font-semibold border-t border-slate-200'>
              <span>Tổng cộng</span>
              <span>{formatCurrency(detail.totalAmount)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        title={
          reviewingItem?.productName
            ? `Đánh giá "${reviewingItem.productName}"`
            : 'Đánh giá sản phẩm'
        }
        open={Boolean(reviewingItem)}
        onCancel={() => setReviewingItemId(null)}
        footer={null}
        destroyOnHidden
      >
        {reviewingItem ? (
          <ReviewForm
            loading={createReviewMutation.isPending}
            onSubmit={async (values) => {
              await createReviewMutation.mutateAsync(values)
            }}
            onCancel={() => setReviewingItemId(null)}
          />
        ) : null}
      </Modal>
    </div>
  )
}
