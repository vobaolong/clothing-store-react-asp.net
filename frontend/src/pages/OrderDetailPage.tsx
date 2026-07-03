import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Modal } from 'antd'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { getAuthToken } from '@/state/auth/auth-session'
import { cancelMyOrder, getMyOrderDetail } from '@/api/orders-api'
import { createReview } from '@/api/reviews-api'
import toast from 'react-hot-toast'
import { LeftOutlined } from '@ant-design/icons'
import { OrderStatus } from '@/enums'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'
import OrderDetailInfoCard from '@/components/order/OrderDetailInfoCard'
import OrderDetailItemsTable from '@/components/order/OrderDetailItemsTable'
import {
  OrderDetailTimelineCard,
  OrderDetailTotalsCard
} from '@/components/order/OrderDetailTimelineCard'
import OrderDetailReviewModal from '@/components/order/OrderDetailReviewModal'
import { useTranslation } from 'react-i18next'

export default function OrderDetailPage() {
  const { id } = useParams()
  const token = getAuthToken()
  const queryClient = useQueryClient()
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null)
  const { t } = useTranslation()

  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.myOrderDetail(id),
    queryFn: () => getMyOrderDetail(String(id)),
    enabled: Boolean(token && id)
  })

  useOrderRealtime(id)

  const detail = detailQuery.data
  const reviewingItem =
    detail?.items.find((item) => item.id === reviewingItemId) ?? null

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
    detail?.status === OrderStatus.PENDING ||
    detail?.status === OrderStatus.CONFIRMED

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

  if (!token) return <Navigate to="/login" replace />
  if (detailQuery.isLoading) return <p>Đang tải&hellip;</p>
  if (!detail) return <p>Đơn hàng không tồn tại.</p>

  const subtotal = detail.items.reduce((sum, item) => sum + item.lineTotal, 0)
  const shippingFee = Math.max(
    detail.totalAmount - subtotal + detail.discountAmount,
    0
  )
  const histories = (detail.statusHistories ?? []).toSorted(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  )

  return (
    <div className="space-y-4!">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/profile?tab=orders"
          className="hover:bg-slate-200! dark:hover:bg-slate-800! px-3 py-2.5 rounded-full"
        >
          <LeftOutlined />
        </Link>
        <h1 className="text-xl font-semibold sm:text-2xl m-0!">
          {t('order.orderDetails')}
        </h1>
        <div className="flex gap-3 items-center">
          {canCancelOrder ? (
            <Button
              danger
              loading={cancelOrderMutation.isPending}
              onClick={() =>
                Modal.confirm({
                  title: t('order.cancelOrderTitle'),
                  content: t('order.cancelOrderContent'),
                  okText: t('order.cancelOrder'),
                  okButtonProps: { danger: true },
                  cancelText: t('common.close'),
                  onOk: () => cancelOrderMutation.mutateAsync()
                })
              }
            >
              {t('order.cancelOrder')}
            </Button>
          ) : null}
        </div>
      </div>

      <OrderDetailInfoCard detail={detail} />

      <OrderDetailItemsTable
        items={detail.items}
        onReview={setReviewingItemId}
      />

      <div className="grid grid-cols-2 gap-4">
        <OrderDetailTimelineCard detail={detail} histories={histories} />
        <OrderDetailTotalsCard
          detail={detail}
          subtotal={subtotal}
          shippingFee={shippingFee}
        />
      </div>

      <OrderDetailReviewModal
        item={reviewingItem}
        loading={createReviewMutation.isPending}
        onSubmit={async (values) => {
          await createReviewMutation.mutateAsync(values)
        }}
        onCancel={() => setReviewingItemId(null)}
      />
    </div>
  )
}
