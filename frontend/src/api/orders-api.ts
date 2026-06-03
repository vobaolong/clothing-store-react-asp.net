import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type { PlaceOrderPayload, MyOrder, MyOrderDetail } from '@/types'

export const getMyOrders = async (
  status?: string
): Promise<{
  orders: MyOrder[]
  counts: Array<{ status: string; count: number }>
}> => {
  return apiData(
    apiClient.get(API_ENDPOINTS.orders.mine, {
      params: status ? { status } : undefined
    })
  )
}

export const getMyOrderDetail = async (id: string): Promise<MyOrderDetail> => {
  return apiData(apiClient.get(API_ENDPOINTS.orders.mineById(id)))
}

export const placeOrder = async (
  payload: PlaceOrderPayload
): Promise<string> => {
  return apiData(apiClient.post(API_ENDPOINTS.orders.create, payload))
}

export const cancelMyOrder = async (id: string): Promise<void> => {
  await apiVoid(apiClient.put(API_ENDPOINTS.orders.cancelMineById(id)))
}
