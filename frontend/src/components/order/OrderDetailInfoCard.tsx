import { Card, Descriptions } from 'antd'
import { formatDate, formatStructuredAddress } from '@/utils/format'
import type { MyOrderDetail } from '@/types/order.type'
import { useTranslation } from 'react-i18next'

interface OrderDetailInfoCardProps {
  detail: MyOrderDetail
}

const ORDER_STATUS_KEYS = {
  Pending: 'order.pending',
  Confirmed: 'order.confirmed',
  Shipping: 'order.shipping',
  Delivered: 'order.delivered',
  Cancelled: 'order.cancelled'
} as const

const PAYMENT_STATUS_KEYS = {
  Unpaid: 'payment.unpaid',
  Paid: 'payment.paid',
  Refunded: 'payment.refunded'
} as const

export default function OrderDetailInfoCard({
  detail
}: OrderDetailInfoCardProps) {
  const { t } = useTranslation()
  const statusKey =
    ORDER_STATUS_KEYS[detail.status as keyof typeof ORDER_STATUS_KEYS]
  const statusLabel = statusKey ? t(statusKey) : detail.status
  const paymentStatusKey =
    PAYMENT_STATUS_KEYS[
      detail.paymentStatus as keyof typeof PAYMENT_STATUS_KEYS
    ]
  const paymentStatusLabel = paymentStatusKey
    ? t(paymentStatusKey)
    : detail.paymentStatus

  return (
    <Card className="rounded-2xl" title={t('order.orderInfo')}>
      <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
        <Descriptions.Item label={t('order.orderId')}>
          {detail.id.slice(0, 8).toUpperCase()}
        </Descriptions.Item>
        <Descriptions.Item label={t('order.purchaseDate')}>
          {formatDate(detail.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label={t('order.status')}>
          {statusLabel}
        </Descriptions.Item>
        <Descriptions.Item label={t('order.paymentMethod')}>
          {detail.paymentMethod}
        </Descriptions.Item>
        <Descriptions.Item label={t('order.paymentStatus')}>
          {paymentStatusLabel}
        </Descriptions.Item>
        <Descriptions.Item label={t('order.recipientName')}>
          {detail.shippingName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('order.recipientPhone')}>
          {detail.shippingPhone || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('order.recipientAddress')}>
          {formatStructuredAddress(detail)}
        </Descriptions.Item>
        {detail.note && (
          <Descriptions.Item label={t('common.note')}>
            {detail.note}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  )
}
