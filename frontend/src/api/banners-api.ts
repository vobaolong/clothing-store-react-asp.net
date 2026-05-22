import { apiClient } from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { HomepageBanner } from '@/types'

export const getActiveBanners = async (): Promise<HomepageBanner[]> =>
  (await apiClient.get(API_ENDPOINTS.banners.active)).data.data.map(
    (banner: HomepageBanner) => ({
      id: banner.id,
      imageUrl: banner.imageUrl,
      ctaLink: banner.ctaLink
    })
  ) as HomepageBanner[]
