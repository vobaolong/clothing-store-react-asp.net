import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import { CouponStatus } from '@/enums'
import type { Coupon, AvailableCoupon, CouponUpsertPayload } from '@/types'

export const getAdminCoupons = async (
  status?: CouponStatus
): Promise<Coupon[]> =>
  apiData(apiClient.get(API_ENDPOINTS.coupons.admin, { params: { status } }))

export const createCoupon = async (
  payload: CouponUpsertPayload
): Promise<void> =>
  apiVoid(apiClient.post(API_ENDPOINTS.coupons.admin, payload))

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
}): Promise<{ code: string; discountAmount: number }> =>
  apiData(apiClient.post(API_ENDPOINTS.coupons.validate, payload))

export type { Coupon, AvailableCoupon, CouponUpsertPayload }
