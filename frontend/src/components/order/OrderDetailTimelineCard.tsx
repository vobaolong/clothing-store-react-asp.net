import { Card, Timeline } from 'antd'
import { formatCurrency, formatDate } from '@/utils/format'
import { OrderStatus } from '@/enums'
import type { MyOrderDetail } from '@/types'

type StatusHistory = { status: string; changedAt: string }

const STEP_COPY: Record<string, string> = {
  [OrderStatus.CONFIRMED]: 'Đơn hàng đã được xác nhận',
  [OrderStatus.SHIPPING]: 'Đơn hàng đang trên đường vận chuyển',
  [OrderStatus.DELIVERED]: 'Giao hàng thành công',
  [OrderStatus.CANCELLED]: 'Đơn hàng đã bị huỷ'
}

function timelineColorForStatus(status: string) {
  if (status === OrderStatus.DELIVERED) return 'green'
  if (status === OrderStatus.CANCELLED) return 'red'
  return 'blue'
}

function buildTimelineItems(detail: MyOrderDetail, histories: StatusHistory[]) {
  // build history steps, filtering pending + dedup + only known steps
  const seenStep = new Set<string>()
  const historySteps = histories
    .filter((h) => h.status !== OrderStatus.PENDING)
    .filter((h) => {
      if (seenStep.has(h.status)) return false
      seenStep.add(h.status)
      return Boolean(STEP_COPY[h.status as OrderStatus])
    })

  // synthetic step for delivered/cancelled when history is missing
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
          <span>Đơn hàng đã được đặt</span>
          <span className="text-sm! text-slate-500">
            {formatDate(detail.createdAt)}
          </span>
        </div>
      )
    },
    ...historySteps.map((step) => ({
      color: timelineColorForStatus(step.status),
      content: (
        <div className="flex justify-between">
          <span>{STEP_COPY[step.status] ?? step.status}</span>
          <span className="text-sm! text-slate-500">
            {formatDate(step.changedAt)}
          </span>
        </div>
      )
    })),
    ...(synth
      ? [
          {
            color: timelineColorForStatus(synth.status),
            content: (
              <div className="flex justify-between">
                <span>{STEP_COPY[synth.status] ?? synth.status}</span>
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
  const timelineItems = buildTimelineItems(detail, histories)

  return (
    <Card className="rounded-2xl" title="Trạng thái đơn hàng">
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
  return (
    <Card className="rounded-2xl" title="Tổng tiền">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Thành tiền</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Giảm giá</span>
          <span className="text-emerald-600">
            {detail.couponCodeSnapshot && (
              <span className="mr-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded">
                {detail.couponCodeSnapshot}
              </span>
            )}
            -{formatCurrency(detail.discountAmount || 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span>{formatCurrency(shippingFee)}</span>
        </div>
        <div className="flex justify-between pt-2 mt-2 font-semibold border-t border-slate-200 dark:border-slate-600">
          <span>Tổng cộng</span>
          <span>{formatCurrency(detail.totalAmount)}</span>
        </div>
      </div>
    </Card>
  )
}
