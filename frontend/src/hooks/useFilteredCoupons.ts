import { useMemo } from 'react'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'
import type { Coupon } from '@/types'

interface UseFilteredCouponsProps {
  data: Coupon[] | undefined
  search: string
  discountType: string
  status: string
}

export function useFilteredCoupons({
  data,
  search,
  discountType,
  status
}: UseFilteredCouponsProps) {
  return useMemo(() => {
    const needle = adminSearchNeedle(search)
    const list = data ?? []

    return list.filter((c: Coupon) => {
      const typeMatch =
        discountType === ADMIN_FILTER_ALL_VALUE ||
        c.discountType === discountType
      const statusMatch =
        status === ADMIN_FILTER_ALL_VALUE || c.status === status
      const searchMatch =
        !needle ||
        adminRowMatches(
          needle,
          c.code,
          c.id,
          String(c.discountAmount),
          String(c.minOrderSubtotal)
        )

      return typeMatch && statusMatch && searchMatch
    })
  }, [data, search, discountType, status])
}
