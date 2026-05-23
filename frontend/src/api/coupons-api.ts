import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import { CouponStatus } from '@/enums'
import type { Coupon, AvailableCoupon, CouponUpsertPayload } from '@/types'
import { calculateCouponDiscountAmount } from '@/utils/coupon-discount'

export const getAdminCoupons = async (
  status?: CouponStatus
): Promise<Coupon[]> =>
  apiData(apiClient.get(API_ENDPOINTS.coupons.admin, { params: { status } }))

export const createCoupon = async (
  payload: CouponUpsertPayload
): Promise<void> => apiVoid(apiClient.post(API_ENDPOINTS.coupons.admin, payload))

export const updateCoupon = async (
  id: string,
  payload: Partial<CouponUpsertPayload> & { status?: CouponStatus }
): Promise<void> =>
  apiVoid(apiClient.put(API_ENDPOINTS.coupons.adminById(id), payload))

export const deleteCoupon = async (id: string): Promise<void> =>
  apiVoid(apiClient.delete(API_ENDPOINTS.coupons.adminById(id)))

export const getAvailableCoupons = async (): Promise<AvailableCoupon[]> =>
  apiData(apiClient.get(API_ENDPOINTS.coupons.available))

export const validateCoupon = async (payload: {
  code: string
  orderTotal: number
}): Promise<{ code: string; discountAmount: number }> => {
  const coupon = (await getAvailableCoupons()).find(
    (item) => item.code.toUpperCase() === payload.code.toUpperCase()
  )
  if (!coupon) throw new Error('Coupon not found')
  if (payload.orderTotal < coupon.minOrderSubtotal) {
    throw new Error('Order total does not meet minimum subtotal')
  }
  const discountAmount = calculateCouponDiscountAmount(
    coupon,
    payload.orderTotal
  )
  if (discountAmount > payload.orderTotal) {
    throw new Error('Coupon is not applicable')
  }
  return {
    code: coupon.code,
    discountAmount
  }
}

export type { Coupon, AvailableCoupon, CouponUpsertPayload }
