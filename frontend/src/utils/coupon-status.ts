import { Tag } from 'antd'
import { createElement } from 'react'
import type { Coupon } from '@/types'

export type CouponStatus =
  | 'Active'
  | 'Expired'
  | 'Inactive'
  | 'Archived'
  | 'Scheduled'

const toYmdUtc = (iso: string) => iso.slice(0, 10)

export const resolveCouponStatus = (coupon: Coupon): CouponStatus => {
  if (coupon.status === 'Archived') return 'Archived'

  const todayUtc = toYmdUtc(new Date().toISOString())
  const expiresAtUtc = toYmdUtc(coupon.expiresAt)
  if (expiresAtUtc <= todayUtc) return 'Expired'

  if (coupon.startsAt) {
    const startsAtUtc = toYmdUtc(coupon.startsAt)
    if (startsAtUtc > todayUtc) return 'Scheduled'
  }

  if (coupon.status === 'Inactive') return 'Inactive'
  return 'Active'
}

const COUPON_STATUS_COLORS: Record<CouponStatus, string> = {
  Active: 'green',
  Expired: 'red',
  Inactive: 'default',
  Archived: 'purple',
  Scheduled: 'orange'
}

export const getCouponStatus = (coupon: Coupon) => {
  const status = resolveCouponStatus(coupon)
  return createElement(Tag, { color: COUPON_STATUS_COLORS[status] }, status)
}
