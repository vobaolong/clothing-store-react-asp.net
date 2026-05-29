import { useMemo } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'
import type { AdminOrder, DateRangeType } from '@/types'

dayjs.extend(isBetween)

interface UseFilteredOrdersProps {
  data: AdminOrder[] | undefined
  search: string
  status: string
  payment: string
  dateRange: DateRangeType
}

export function useFilteredOrders({
  data,
  search,
  status,
  payment,
  dateRange
}: UseFilteredOrdersProps) {
  return useMemo(() => {
    const list = data ?? []
    const needle = adminSearchNeedle(search)
    const startOfDay = dateRange?.[0]?.startOf('day')
    const endOfDay = dateRange?.[1]?.endOf('day')

    return list.filter((o) => {
      const statusMatch =
        status === ADMIN_FILTER_ALL_VALUE || o.status === status
      const paymentMatch =
        payment === ADMIN_FILTER_ALL_VALUE || o.paymentStatus === payment

      const createdAt = dayjs(o.createdAt)
      const createdAtMatch =
        !startOfDay ||
        !endOfDay ||
        createdAt.isBetween(startOfDay, endOfDay, 'day', '[]')

      const searchMatch =
        !needle ||
        adminRowMatches(
          needle,
          o.id,
          o.userEmail,
          o.status,
          o.paymentStatus,
          getVietnameseStatusLabel(o.status),
          getVietnameseStatusLabel(o.paymentStatus),
          String(o.totalAmount),
          String(o.itemCount ?? '')
        )

      return statusMatch && paymentMatch && createdAtMatch && searchMatch
    })
  }, [data, search, status, payment, dateRange])
}
