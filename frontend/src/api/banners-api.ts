import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type { HomepageBanner } from '@/types'

export const getActiveBanners = async (): Promise<HomepageBanner[]> =>
  (
    await apiData<HomepageBanner[]>(apiClient.get(API_ENDPOINTS.banners.active))
  ).map((banner) => ({
    id: banner.id,
    imageUrl: banner.imageUrl,
    ctaLink: banner.ctaLink
  })) as HomepageBanner[]
