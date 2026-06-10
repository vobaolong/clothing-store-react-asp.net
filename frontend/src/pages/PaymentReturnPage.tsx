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
import { useDispatch } from 'react-redux'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getMyOrderDetail } from '@/api/orders-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { PENDING_VNPAY_CART_ITEMS_KEY } from '@/constants/order.constant'
import { handleVnPayReturn } from '@/api/payments-api'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import { formatCurrency } from '@/utils/format'
import { removePurchasedCartItems } from '@/state/cart-slice'

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

function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Không thể xác minh kết quả thanh toán.'
  }

  return String(
    (error.response?.data as { message?: string } | undefined)?.message ??
      'Không thể xác minh kết quả thanh toán.'
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

function getViewConfig(state: PaymentViewState, errorMessage: string) {
  const configByState = {
    loading: {
      icon: <Spinner />,
      iconBg: 'bg-gray-100',
      title: 'Đang xác minh thanh toán',
      subtitle: 'Vui lòng chờ trong khi hệ thống xác nhận giao dịch với VNPay.'
    },
    invalid: {
      icon: <IconWarning />,
      iconBg: 'bg-amber-50',
      title: 'Đường dẫn trả về không hợp lệ',
      subtitle:
        'Thiếu tham số VNPay bắt buộc. Vui lòng quay lại đơn hàng và thử thanh toán lại.'
    },
    error: {
      icon: <IconError />,
      iconBg: 'bg-red-50',
      title: 'Xác minh thất bại',
      subtitle: errorMessage
    },
    success: {
      icon: <IconSuccess />,
      iconBg: 'bg-green-50',
      title: 'Thanh toán thành công',
      subtitle:
        'Giao dịch của bạn đã được xác nhận và đơn hàng đang được xử lý.'
    },
    unpaid: {
      icon: <IconError />,
      iconBg: 'bg-red-50',
      title: 'Thanh toán chưa hoàn tất',
      subtitle:
        'Không thể xác minh thanh toán. Hệ thống chưa ghi nhận trừ tiền. Vui lòng thử lại từ trang đơn hàng.'
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

    const raw = sessionStorage.getItem(PENDING_VNPAY_CART_ITEMS_KEY)
    if (!raw) return

    try {
      const items = JSON.parse(raw) as Array<{
        id: string
        productVariantId: string
      }>
      dispatch(removePurchasedCartItems(items))
      sessionStorage.removeItem(PENDING_VNPAY_CART_ITEMS_KEY)
    } catch {
      sessionStorage.removeItem(PENDING_VNPAY_CART_ITEMS_KEY)
    }
  }, [dispatch, query.data, responseCode])

  const missingParams = !txnRef || !responseCode || !hasSecureHash
  const errorMessage = getErrorMessage(query.error)
  const isSuccess = isSuccessfulPayment(query.data, responseCode)
  const state = getViewState({
    isFetching: query.isFetching,
    isError: query.isError,
    missingParams,
    isSuccess
  })
  const config = getViewConfig(state, errorMessage)

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-10">
      <div className="overflow-hidden w-full bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="py-8 px-8 text-center border-b border-gray-100">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${config.iconBg}`}
          >
            {config.icon}
          </div>

          <h1 className="mb-2 text-2xl font-normal tracking-tight leading-tight text-gray-900">
            {config.title}
          </h1>
          <p className="text-sm font-light leading-relaxed text-gray-700">
            {config.subtitle}
          </p>
        </div>

        {query.data && (
          <div className="py-4 px-8">
            <DetailRow
              label="Mã đơn hàng"
              value={`#${query.data.orderId.slice(0, 8).toUpperCase()}`}
            />
            <DetailRow
              label="Trạng thái thanh toán"
              badge={query.data.paymentStatus}
            />
            <DetailRow
              label="Giá trị đơn hàng"
              value={formatTotalAmount(
                orderDetailQuery.data?.totalAmount ?? query.data.totalAmount
              )}
            />
            {txnRef && <DetailRow label="Mã giao dịch" value={txnRef} />}
          </div>
        )}

        <div className="flex gap-2.5 px-8 pb-8">
          <Link to="/profile?tab=orders" className="flex-1">
            <Button
              type="primary"
              block
              size="large"
              style={{ borderRadius: 10, fontWeight: 500 }}
            >
              Xem đơn hàng
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button
              block
              size="large"
              style={{ borderRadius: 10, fontWeight: 500 }}
            >
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
