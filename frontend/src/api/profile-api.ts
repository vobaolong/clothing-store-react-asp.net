import { apiClient } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { MyProfile } from '@/types'

export const getMyProfile = async (): Promise<MyProfile> => {
  const { data } = await apiClient.get(API_ENDPOINTS.account.profile)
  return data.data
}

export const updateMyProfile = async (payload: {
  fullName: string
  phone: string
}) => apiClient.put(API_ENDPOINTS.account.profile, payload)
