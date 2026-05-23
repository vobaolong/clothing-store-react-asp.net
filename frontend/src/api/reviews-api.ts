import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { ProductReviews } from '@/types'

export const getProductReviews = async (
  productId: string,
): Promise<ProductReviews> => {
  return apiData(
    apiClient.get(API_ENDPOINTS.reviews.byProduct(productId)),
  )
}

export const createReview = async (payload: {
  productId: string
  orderItemId?: string
  rating: number
  comment?: string
  tags?: string[]
}) => {
  return apiData<unknown>(apiClient.post(API_ENDPOINTS.reviews.root, payload))
}

export const updateReview = async (
  reviewId: string,
  payload: { rating: number; comment?: string; tags?: string[] },
) => {
  return apiData<unknown>(
    apiClient.put(API_ENDPOINTS.reviews.byId(reviewId), payload),
  )
}

export const deleteReview = async (reviewId: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.reviews.byId(reviewId)))
