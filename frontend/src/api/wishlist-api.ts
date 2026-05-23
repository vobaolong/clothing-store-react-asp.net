import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { Product } from '@/types'

export const getWishlistProducts = async (): Promise<Product[]> =>
  apiData(apiClient.get(API_ENDPOINTS.wishlist.root))

export const addToWishlist = async (productId: string): Promise<void> =>
  apiVoid(apiClient.post(API_ENDPOINTS.wishlist.byProduct(productId)))

export const removeFromWishlist = async (productId: string): Promise<void> =>
  apiVoid(apiClient.delete(API_ENDPOINTS.wishlist.byProduct(productId)))
