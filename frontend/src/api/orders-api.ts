import { apiClient } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { PlaceOrderPayload, MyOrder, MyOrderDetail } from '@/types'

export const getMyOrders = async (
  status?: string
): Promise<{
  orders: MyOrder[]
  counts: Array<{ status: string; count: number }>
}> => {
  const { data } = await apiClient.get(API_ENDPOINTS.orders.mine, {
    params: status ? { status } : undefined
  })
  return data.data
}

export const getMyOrderDetail = async (id: string): Promise<MyOrderDetail> => {
  const { data } = await apiClient.get(API_ENDPOINTS.orders.mineById(id))
  return data.data
}

export const placeOrder = async (
  payload: PlaceOrderPayload
): Promise<string> => {
  const { data } = await apiClient.post(API_ENDPOINTS.orders.create, payload)
  return data.data as string
}

export const cancelMyOrder = async (id: string): Promise<void> => {
  await apiClient.put(API_ENDPOINTS.orders.cancelMineById(id))
}
