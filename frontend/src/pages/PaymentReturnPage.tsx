import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { Button } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getMyOrderDetail } from '@/api/orders-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { handleVnPayReturn } from '@/api/payments-api'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { formatCurrency } from '@/utils/format'
import { removePurchasedCartItems } from '@/state/cart-slice'
import { STORAGE_KEYS } from '@/constants/storage-keys.constant'
import { lp } from '@/utils/language-path'

function IconSuccess() {
  return <CheckCircleOutlined style={{ fontSize: 28, color: '#3B6D11' }} />
}

function IconError() {
  return <CloseCircleOutlined style={{ fontSize: 28, color: '#A32D2D' }} />
}

function IconWarning() {
  return (
    <ExclamationCircleOutlined style={{ fontSize: 28, color: '#854F0B' }} />
  )
}

function Spinner() {
  return <LoadingOutlined style={{ fontSize: 28, color: '#6b7280' }} spin />
}

type BadgeVariant = 'paid' | 'pending' | 'failed'

const badgeStyles: Record<BadgeVariant, string> = {
  paid: 'bg-[#EAF3DE] text-[#3B6D11]',
  pending: 'bg-[#FAEEDA] text-[#854F0B]',
  failed: 'bg-[#FCEBEB] text-[#A32D2D]'
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase()
  const key = (
    normalizedStatus === 'paid'
      ? 'paid'
      : normalizedStatus === 'failed' ||
          normalizedStatus === 'cancelled' ||
          normalizedStatus === 'refunded'
        ? 'failed'
        : 'pending'
  ) as BadgeVariant

  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wide ${badgeStyles[key]}`}
    >
      {getVietnameseLabel(status)}
    </span>
  )
}

function DetailRow({
  label,
  value,
  badge
}: {
  label: string
  value?: string
  badge?: string
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[13px] text-gray-400">{label}</span>
      {badge ? (
        <StatusBadge status={badge} />
      ) : (
        <span className="text-[13px] font-medium tabular-nums text-gray-800">
          {value}
        </span>
      )}
    </div>
  )
}

type PaymentViewState = 'loading' | 'invalid' | 'error' | 'success' | 'unpaid'

type PaymentResultData = {
  orderId: string
  paymentStatus: string
  totalAmount?: number | string | null
}

function getErrorMessage(
  error: unknown,
  t: (key: string | string[]) => string
): string {
  if (!axios.isAxiosError(error)) {
    return t('payment.verifyError')
  }

  return String(
    (error.response?.data as { message?: string } | undefined)?.message ??
      t('payment.verifyError')
  )
}

function isSuccessfulPayment(
  data: PaymentResultData | undefined,
  responseCode: string
) {
  if (!data) {
    return false
  }

  if (responseCode === '00') {
    return true
  }

  return ['paid', 'success', 'completed'].includes(
    data.paymentStatus.toLowerCase()
  )
}

function getViewState({
  isFetching,
  isError,
  missingParams,
  isSuccess
}: {
  isFetching: boolean
  isError: boolean
  missingParams: boolean
  isSuccess: boolean
}): PaymentViewState {
  if (isFetching) {
    return 'loading'
  }

  if (missingParams) {
    return 'invalid'
  }

  if (isError) {
    return 'error'
  }

  if (isSuccess) {
    return 'success'
  }

  return 'unpaid'
}

function getViewConfig(
  state: PaymentViewState,
  errorMessage: string,
  t: (key: string | string[]) => string
) {
  const configByState = {
    loading: {
      icon: <Spinner />,
      iconBg: 'bg-gray-100',
      title: t('payment.verifying'),
      subtitle: t('payment.verifyingSubtitle')
    },
    invalid: {
      icon: <IconWarning />,
      iconBg: 'bg-amber-50',
      title: t('payment.invalidReturn'),
      subtitle: t('payment.invalidReturnSubtitle')
    },
    error: {
      icon: <IconError />,
      iconBg: 'bg-red-50',
      title: t('payment.verificationFailed'),
      subtitle: errorMessage
    },
    success: {
      icon: <IconSuccess />,
      iconBg: 'bg-green-50',
      title: t('payment.paymentSuccess'),
      subtitle: t('payment.paymentSuccessSubtitle')
    },
    unpaid: {
      icon: <IconError />,
      iconBg: 'bg-red-50',
      title: t('payment.paymentIncomplete'),
      subtitle: t('payment.paymentIncompleteSubtitle')
    }
  } satisfies Record<
    PaymentViewState,
    { icon: ReactNode; iconBg: string; title: string; subtitle: string }
  >

  return configByState[state]
}

function formatTotalAmount(amount: number | string | null | undefined): string {
  if (typeof amount === 'number') {
    return Number.isFinite(amount) ? formatCurrency(amount) : '—'
  }

  if (typeof amount === 'string') {
    const cleaned = amount
      .trim()
      .replace(/\s/g, '')
      .replace(/[^\d,.-]/g, '')

    if (cleaned === '') {
      return '—'
    }

    const directParsed = Number(cleaned.replace(/,/g, ''))
    if (Number.isFinite(directParsed)) {
      return formatCurrency(directParsed)
    }

    const groupedParsed = Number(cleaned.replace(/[.,]/g, ''))
    if (Number.isFinite(groupedParsed)) {
      return formatCurrency(groupedParsed)
    }
  }

  return '—'
}

export default function PaymentReturnPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const { search } = useLocation()
  const txnRef = params.get('vnp_TxnRef') ?? ''
  const responseCode = params.get('vnp_ResponseCode') ?? ''
  const hasSecureHash = Boolean(params.get('vnp_SecureHash'))
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  const query = useQuery({
    queryKey: QUERY_KEYS.vnpayReturn(txnRef, responseCode),
    queryFn: () => handleVnPayReturn(search),
    enabled: Boolean(txnRef && responseCode && hasSecureHash),
    retry: false,
    refetchOnWindowFocus: false
  })

  const orderDetailQuery = useQuery({
    queryKey: QUERY_KEYS.myOrderDetail(query.data?.orderId ?? ''),
    queryFn: () => getMyOrderDetail(query.data!.orderId),
    enabled: Boolean(query.data?.orderId),
    retry: false,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    if (!query.data) {
      return
    }

    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myOrders(undefined) })
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.myOrderDetail(query.data.orderId)
    })
  }, [query.data, queryClient])

  useEffect(() => {
    if (!isSuccessfulPayment(query.data, responseCode)) return

    const raw = sessionStorage.getItem(STORAGE_KEYS.pendingVnPayCartItems)
    if (!raw) return

    try {
      const items = JSON.parse(raw) as Array<{
        id: string
        productVariantId: string
      }>
      dispatch(removePurchasedCartItems(items))
      sessionStorage.removeItem(STORAGE_KEYS.pendingVnPayCartItems)
    } catch {
      sessionStorage.removeItem(STORAGE_KEYS.pendingVnPayCartItems)
    }
  }, [dispatch, query.data, responseCode])

  const missingParams = !txnRef || !responseCode || !hasSecureHash
  const errorMessage = getErrorMessage(query.error, t as never)
  const isSuccess = isSuccessfulPayment(query.data, responseCode)
  const state = getViewState({
    isFetching: query.isFetching,
    isError: query.isError,
    missingParams,
    isSuccess
  })
  const config = getViewConfig(state, errorMessage, t as never)

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-10">
      <div className="w-full overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="px-8 py-8 text-center border-b border-gray-100">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${config.iconBg}`}
          >
            {config.icon}
          </div>

          <h1 className="mb-2 text-2xl">{config.title}</h1>
          <p className="text-sm font-light leading-relaxed text-gray-700">
            {config.subtitle}
          </p>
        </div>

        {query.data && (
          <div className="px-8 py-4">
            <DetailRow
              label={t('payment.orderCode')}
              value={`#${query.data.orderId.slice(0, 8).toUpperCase()}`}
            />
            <DetailRow
              label={t('payment.paymentStatus')}
              badge={query.data.paymentStatus}
            />
            <DetailRow
              label={t('payment.orderValue')}
              value={formatTotalAmount(
                orderDetailQuery.data?.totalAmount ?? query.data.totalAmount
              )}
            />
            {txnRef && (
              <DetailRow label={t('payment.transactionCode')} value={txnRef} />
            )}
          </div>
        )}

        <div className="flex gap-2.5 px-8 pb-8">
          <Link to={lp('/profile?tab=orders')} className="flex-1">
            <Button
              type="primary"
              block
              size="large"
              style={{ borderRadius: 10, fontWeight: 500 }}
            >
              {t('payment.viewOrder')}
            </Button>
          </Link>
          <Link to={lp('/')} className="flex-1">
            <Button
              block
              size="large"
              style={{ borderRadius: 10, fontWeight: 500 }}
            >
              {t('payment.continueShopping')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
