import { apiClient } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { ProductReviews } from '@/types'

export const getProductReviews = async (
  productId: string,
): Promise<ProductReviews> => {
  const { data } = await apiClient.get(
    API_ENDPOINTS.reviews.byProduct(productId),
  )
  return data.data
}

export const createReview = async (payload: {
  productId: string
  orderItemId?: string
  rating: number
  comment?: string
  tags?: string[]
}) => {
  const { data } = await apiClient.post(API_ENDPOINTS.reviews.root, payload)
  return data.data as unknown
}

export const updateReview = async (
  reviewId: string,
  payload: { rating: number; comment?: string; tags?: string[] },
) => {
  const { data } = await apiClient.put(
    `${API_ENDPOINTS.reviews.root}/${reviewId}`,
    payload,
  )
  return data.data as unknown
}

export const deleteReview = async (reviewId: string) =>
  apiClient.delete(`${API_ENDPOINTS.reviews.root}/${reviewId}`)
