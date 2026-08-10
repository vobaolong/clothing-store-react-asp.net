import { apiClient, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'

export const submitFeedback = async (payload: {
  name: string
  email: string
  message: string
}): Promise<void> => {
  await apiVoid(apiClient.post(API_ENDPOINTS.feedback.root, payload))
}
