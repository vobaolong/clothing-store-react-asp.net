import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'

export const createVnPayUrl = async (
  orderId: string
): Promise<{ paymentUrl: string }> =>
  apiData(apiClient.post(API_ENDPOINTS.payments.vnpayCreateUrl, { orderId }))

export const handleVnPayReturn = async (
  queryString: string
): Promise<{ orderId: string; paymentStatus: string; totalAmount: number }> => {
  const url = `${API_ENDPOINTS.payments.vnpayReturn}${queryString.startsWith('?') ? queryString : `?${queryString}`}`
  return apiData(apiClient.get(url))
}
