import type { DateFormatMode } from '@/types'

export type ShippingAddressLike = {
  shippingStreet?: string
  shippingWard?: string
  shippingProvince?: string
  shippingAddress?: string
}

export const formatStructuredAddress = (detail: ShippingAddressLike): string => {
  const structured = [detail.shippingStreet, detail.shippingWard, detail.shippingProvince]
    .filter((x) => x?.trim())
    .join(', ')
  return structured || detail.shippingAddress || ''
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export const formatDate = (
  dateString: string | null | undefined,
  mode: DateFormatMode = 'dateTime'
): string => {
  if (dateString == null || String(dateString).trim() === '') {
    return '—'
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  switch (mode) {
    case 'dateOnly':
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)

    case 'dateOnlyUTC':
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      }).format(date)

    default:
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
  }
}
