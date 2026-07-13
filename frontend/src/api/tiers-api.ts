import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type { MyTier } from '@/types'

export const getMyTier = async (): Promise<MyTier> =>
  apiData(apiClient.get(API_ENDPOINTS.tiers.my))
