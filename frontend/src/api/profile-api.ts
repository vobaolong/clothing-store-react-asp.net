import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { MyProfile } from '@/types'

export const getMyProfile = async (): Promise<MyProfile> =>
  apiData(apiClient.get(API_ENDPOINTS.account.profile))

export const updateMyProfile = async (payload: {
  fullName: string
  phone: string
}): Promise<void> =>
  apiVoid(apiClient.put(API_ENDPOINTS.account.profile, payload))
