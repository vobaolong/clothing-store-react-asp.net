import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'

export const createVnPayUrl = async (
  orderId: string
): Promise<{ paymentUrl: string }> =>
  apiData(apiClient.post(API_ENDPOINTS.payments.vnpayCreateUrl, { orderId }))

export const handleVnPayReturn = async (
  rawQueryString: string
): Promise<{ orderId: string; paymentStatus: string; totalAmount: number }> =>
  apiData(
    apiClient.get(
      `${API_ENDPOINTS.payments.vnpayReturn}${rawQueryString.startsWith('?') ? rawQueryString : `?${rawQueryString}`}`,
      {
        timeout: 15000
      }
    )
  )
