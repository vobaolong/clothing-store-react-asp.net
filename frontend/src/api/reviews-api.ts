import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type { ProductReviews } from '@/types'

export const getProductReviews = async (
  productId: string
): Promise<ProductReviews> => {
  return apiData(apiClient.get(API_ENDPOINTS.reviews.byProduct(productId)))
}

export const createReview = async (payload: {
  productId: string
  orderItemId?: string
  rating: number
  comment?: string
  tags?: string[]
}): Promise<void> => {
  await apiVoid(apiClient.post(API_ENDPOINTS.reviews.root, payload))
}
