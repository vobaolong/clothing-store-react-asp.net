import { Card, Timeline } from 'antd'
import { formatCurrency, formatDate } from '@/utils/format'
import { OrderStatus } from '@/enums'
import type { MyOrderDetail } from '@/types'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

type StatusHistory = { status: string; changedAt: string }

const STEP_COPY_KEYS = {
  [OrderStatus.CONFIRMED]: 'order.confirmedMessage',
  [OrderStatus.SHIPPING]: 'order.shippingMessage',
  [OrderStatus.DELIVERED]: 'order.deliveredMessage',
  [OrderStatus.CANCELLED]: 'order.cancelledMessage'
} as const

function timelineColorForStatus(status: string) {
  if (status === OrderStatus.DELIVERED) return 'green'
  if (status === OrderStatus.CANCELLED) return 'red'
  return 'blue'
}

function buildTimelineItems(
  detail: MyOrderDetail,
  histories: StatusHistory[],
  t: TFunction
) {
  const seenStep = new Set<string>()
  const historySteps = histories
    .filter((h) => h.status !== OrderStatus.PENDING)
    .filter(
      (h): h is StatusHistory & { status: keyof typeof STEP_COPY_KEYS } => {
        if (!(h.status in STEP_COPY_KEYS)) return false
        if (seenStep.has(h.status)) return false
        seenStep.add(h.status)
        return true
      }
    )

  const synth =
    (detail.status === OrderStatus.DELIVERED &&
      !historySteps.some((s) => s.status === OrderStatus.DELIVERED)) ||
    (detail.status === OrderStatus.CANCELLED &&
      !historySteps.some((s) => s.status === OrderStatus.CANCELLED))
      ? {
          status: detail.status,
          changedAt: detail.updatedAt ?? detail.paidAt ?? detail.createdAt
        }
      : null

  const items = [
    {
      color: 'gray' as const,
      content: (
        <div className="flex justify-between">
          <span>{t('order.placeholder')}</span>
          <span className="text-sm! text-slate-500">
            {formatDate(detail.createdAt)}
          </span>
        </div>
      )
    },
    ...historySteps.map((step) => {
      const stepKey = STEP_COPY_KEYS[step.status as keyof typeof STEP_COPY_KEYS]
      return {
        color: timelineColorForStatus(step.status),
        content: (
          <div className="flex justify-between gap-2!">
            <span className="max-w-[60%]">
              {stepKey ? t(stepKey) : step.status}
            </span>
            <span className="text-sm! text-slate-500 truncate">
              {formatDate(step.changedAt)}
            </span>
          </div>
        )
      }
    }),
    ...(synth
      ? [
          {
            color: timelineColorForStatus(synth.status),
            content: (
              <div className="flex justify-between">
                <span>
                  {(() => {
                    const synthKey =
                      STEP_COPY_KEYS[
                        synth.status as keyof typeof STEP_COPY_KEYS
                      ]
                    return synthKey ? t(synthKey) : synth.status
                  })()}
                </span>
                <span className="text-sm text-slate-500">
                  {formatDate(synth.changedAt)}
                </span>
              </div>
            )
          }
        ]
      : [])
  ]

  return items
}

interface OrderDetailTimelineCardProps {
  detail: MyOrderDetail
  histories: StatusHistory[]
}

export function OrderDetailTimelineCard({
  detail,
  histories
}: OrderDetailTimelineCardProps) {
  const { t } = useTranslation()
  const timelineItems = buildTimelineItems(detail, histories, t)
  return (
    <Card className="rounded-2xl" title={t('order.orderStatus')}>
      <Timeline items={timelineItems} />
    </Card>
  )
}

interface OrderDetailTotalsCardProps {
  detail: MyOrderDetail
  subtotal: number
  shippingFee: number
}

export function OrderDetailTotalsCard({
  detail,
  subtotal,
  shippingFee
}: OrderDetailTotalsCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="rounded-2xl" title={t('order.orderTotal')}>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>{t('order.subtotal')}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {detail.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>{t('order.discount')}</span>
            <span className="text-emerald-600">
              {detail.couponCodeSnapshot && (
                <span className="mr-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded">
                  {detail.couponCodeSnapshot}
                </span>
              )}
              -{formatCurrency(detail.discountAmount || 0)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{t('order.shippingFee')}</span>
          <span>{formatCurrency(shippingFee)}</span>
        </div>
        <div className="flex justify-between pt-2 mt-2 font-semibold border-t border-slate-200 dark:border-slate-600">
          <span>{t('order.total')}</span>
          <span>{formatCurrency(detail.totalAmount)}</span>
        </div>
      </div>
    </Card>
  )
}
