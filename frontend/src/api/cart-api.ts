import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type { CartItemDto } from '@/types'

export const getMyCart = async (): Promise<CartItemDto[]> => {
  return apiData(apiClient.get(API_ENDPOINTS.cart.root))
}

export const addToCart = async (payload: {
  productId: string
  productVariantId: string
  quantity: number
}): Promise<CartItemDto> => {
  return apiData(apiClient.post(API_ENDPOINTS.cart.root, payload))
}

export const updateCartQuantity = async (
  cartItemId: string,
  quantity: number
): Promise<CartItemDto> => {
  return apiData(
    apiClient.put(API_ENDPOINTS.cart.byId(cartItemId), { quantity })
  )
}

export const removeFromCart = async (cartItemId: string): Promise<void> => {
  await apiVoid(apiClient.delete(API_ENDPOINTS.cart.byId(cartItemId)))
}

export const clearCartOnServer = async (): Promise<void> => {
  await apiVoid(apiClient.delete(API_ENDPOINTS.cart.root))
}

export const mergeGuestCart = async (
  items: Array<{
    productId: string
    productVariantId: string
    quantity: number
  }>
): Promise<CartItemDto[]> => {
  return apiData(apiClient.post(API_ENDPOINTS.cart.merge, { items }))
}
