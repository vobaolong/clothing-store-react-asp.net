import { apiClient } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { Product } from '@/types'

export const getWishlistProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.wishlist.root)
  return data.data
}

export const addToWishlist = async (productId: string): Promise<void> =>
  apiClient.post(API_ENDPOINTS.wishlist.byProduct(productId))

export const removeFromWishlist = async (productId: string): Promise<void> =>
  apiClient.delete(API_ENDPOINTS.wishlist.byProduct(productId))
