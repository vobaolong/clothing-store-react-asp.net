import { LeftOutlined, PrinterOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Image,
  Modal,
  Select,
  Skeleton,
  Tag,
  Tooltip
} from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getAdminOrderDetail, updateAdminOrderStatus } from '@/api/admin-api'
import { OrderStatus, CouponDiscountType } from '@/enums'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { ORDER_STATUS_COLORS } from '@/constants/order-status.constant'
import {
  formatCurrency,
  formatDate,
  formatStructuredAddress
} from '@/utils/format'
import { createOrderStatusOptions } from '@/utils/enum.utils'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { toCapitalize } from '@/utils/table.lib'
import { canUpdateToStatus } from '@/utils/order-status-transition'
import { openBillPrintWindow } from '@/utils/bill-export'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'
import { getAuthToken, isAdmin } from '@/state/auth/auth-session'
import { lp } from '@/utils/language-path'

export default function AdminOrderDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const token = getAuthToken()
  const qc = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(
    undefined
  )

  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.adminOrderDetail(id ?? undefined),
    queryFn: () => getAdminOrderDetail(String(id)),
    enabled: Boolean(id)
  })

  useOrderRealtime(id)

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      updateAdminOrderStatus(String(id), { status }),
    onSuccess: async () => {
      toast.success(t('order.updateStatusSuccess'))
      await Promise.all([
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.adminOrderDetail(id ?? undefined)
        }),
        qc.invalidateQueries({ queryKey: QUERY_KEYS.adminOrdersBase })
      ])
    },
    onError: () => {
      toast.error(t('order.updateStatusFailed'))
    }
  })

  if (!token || !isAdmin()) return <Navigate to="/" replace />

  const detail = detailQuery.data
  const subtotal =
    detail?.items.reduce((sum, item) => sum + item.lineTotal, 0) ?? 0
  const shippingFee =
    detail != null
      ? Math.max(detail.totalAmount - subtotal + detail.discountAmount, 0)
      : 0
  const statusHistories = Array.isArray(detail?.statusHistories)
    ? detail!.statusHistories.toSorted(
        (a, b) =>
          new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
      )
    : []

  const handleExportBill = () => {
    if (!detail) return
    openBillPrintWindow(detail, () => {
      toast.error(t('order.invoicePrintFailed'))
    })
  }

  return (
    <div className="space-y-4!">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center min-w-0 gap-3">
          <Link
            to={lp('/admin/orders')}
            className="text-slate-600! hover:text-slate-500! hover:underline! hover:bg-slate-200! rounded-full p-2 "
          >
            <LeftOutlined />
          </Link>
          <div className="min-w-0">
            <div className="text-2xl font-medium truncate">
              {t('admin.orderTitle', {
                id: detail ? detail.id.slice(0, 8).toUpperCase() : '...'
              })}
            </div>
            {detail ? (
              <div className="text-xs text-slate-500 dark:text-slate-200">
                {t('common.createdAt')} {formatDate(detail.createdAt)}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {detail && (
            <Tag color={ORDER_STATUS_COLORS[detail.paymentStatus]}>
              {getVietnameseLabel(detail.paymentStatus)}
            </Tag>
          )}
          <Select
            value={getVietnameseLabel(selectedStatus ?? detail?.status ?? '')}
            onChange={(value) => setSelectedStatus(value as OrderStatus)}
            disabled={
              detailQuery.isLoading ||
              !detail ||
              detail.status === OrderStatus.CANCELLED ||
              detail.status === OrderStatus.DELIVERED
            }
            options={createOrderStatusOptions().map((option) => ({
              ...option,
              label: getVietnameseLabel(option.value),
              disabled:
                detail == null ||
                !canUpdateToStatus(detail.status, String(option.value))
            }))}
            style={{ width: 150 }}
          />
          {detail &&
            detail.status !== OrderStatus.DELIVERED &&
            detail.status !== OrderStatus.CANCELLED && (
              <Button
                type="primary"
                disabled={detailQuery.isLoading || !detail || !id}
                loading={updateStatusMutation.isPending}
                onClick={() => {
                  if (!selectedStatus) {
                    toast.error(t('order.pleaseSelectStatus'))
                    return
                  }
                  Modal.confirm({
                    title: t('order.updateStatusConfirm'),
                    onOk: async () =>
                      updateStatusMutation.mutateAsync({
                        status: selectedStatus
                      }),
                    okText: t('order.updateStatus'),
                    cancelText: t('common.cancel')
                  })
                }}
              >
                {t('order.updateStatus')}
              </Button>
            )}
          <Button
            disabled={detailQuery.isLoading || !detail}
            onClick={handleExportBill}
            icon={<PrinterOutlined />}
          >
            {t('order.exportInvoice')}
          </Button>
        </div>
      </div>
      {detailQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card
            className="rounded-2xl lg:col-span-2"
            title={t('order.products')}
          >
            <Skeleton active paragraph={{ rows: 7 }} />
          </Card>
          <Card className="rounded-2xl lg:col-span-1" title={t('order.info')}>
            <Skeleton active paragraph={{ rows: 9 }} />
          </Card>
          <Card className="rounded-2xl lg:col-span-2" title={t('order.total')}>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        </div>
      ) : !detail ? (
        <Card className="rounded-2xl">
          <p className="m-0 text-slate-600">{t('order.notFound')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4! lg:col-span-2">
            <Card
              className="rounded-2xl"
              title={`${t('order.products')} (${detail.items.length})`}
            >
              {detail.items.length === 0 ? (
                <Empty description={t('order.noItems')} />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-600">
                  {detail.items.map((row) => {
                    return (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div className="flex items-center min-w-0 gap-3">
                          <Image
                            alt={row.productName}
                            src={row.imageUrl}
                            className="h-20! w-20! rounded-lg object-cover border border-slate-200"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {toCapitalize(row.productName)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {toCapitalize(row.variantColor)}
                              {row.variantSize
                                ? ` / ${toCapitalize(row.variantSize)}`
                                : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 shrink-0">
                          <div className="text-sm text-slate-600 dark:text-slate-200">
                            {t('order.quantityShort')}{' '}
                            <span className="font-medium text-slate-800 dark:text-slate-400">
                              {row.quantity}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(row.lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className="rounded-2xl" title={t('order.orderSummary')}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('order.subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {detail.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>{t('order.discount')}</span>
                    <span className="text-emerald-600">
                      <Tooltip
                        title={
                          detail.couponDiscountTypeSnapshot ===
                          CouponDiscountType.PERCENT
                            ? t('order.discountPercent', {
                                value: detail.couponDiscountValueSnapshot
                              })
                            : t('order.discountFlat', {
                                value: detail.couponDiscountValueSnapshot
                              })
                        }
                        color="blue"
                      >
                        {detail.couponCodeSnapshot && (
                          <span className="inline-block px-2 py-1 mr-2 text-xs rounded text-emerald-800 bg-emerald-100">
                            {detail.couponCodeSnapshot}
                          </span>
                        )}
                      </Tooltip>
                      -{formatCurrency(detail.discountAmount || 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('order.shippingFee')}</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 font-semibold border-t border-slate-200 dark:border-slate-600">
                  <span>{t('common.total')}</span>
                  <span>{formatCurrency(detail.totalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4! lg:col-span-1">
            <Card className="rounded-2xl" title={t('order.shippingAddress')}>
              <Descriptions column={1} size="small" layout="horizontal">
                <Descriptions.Item label={t('order.fullName')}>
                  {detail.shippingName || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('order.phone')}>
                  {detail.shippingPhone || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('order.address')}>
                  {formatStructuredAddress(detail) || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('order.label')}>
                  {detail.shippingLabel === 'Home'
                    ? t('checkout.home')
                    : detail.shippingLabel === 'Office'
                      ? t('checkout.office')
                      : '—'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card className="rounded-2xl" title={t('common.customerInfo')}>
              <Descriptions column={1} size="small" layout="horizontal">
                <Descriptions.Item label={t('order.username')}>
                  {detail.userName || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('auth.email')}>
                  <span className="whitespace-nowrap">
                    {detail.userEmail || '—'}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            {detail.note && (
              <Card className="rounded-2xl" title={t('common.note')}>
                <div className="text-slate-700">{detail.note?.trim()}</div>
              </Card>
            )}
            <Card className="rounded-2xl" title={t('order.statusHistory')}>
              {statusHistories.length === 0 ? (
                <p className="m-0 text-slate-600">—</p>
              ) : (
                <div className="space-y-2">
                  {statusHistories.map((h, idx) => (
                    <div key={`${h.changedAt}-${idx}`} className="text-sm">
                      <span className="text-slate-500">
                        {formatDate(h.changedAt)} -{' '}
                      </span>
                      <span className="font-medium">
                        {getVietnameseLabel(h.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
