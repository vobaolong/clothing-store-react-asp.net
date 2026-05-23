import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { Product, Category } from '@/types'
import { withDerivedProductImages } from '@/utils/product-color-images'

export const getProducts = async (): Promise<Product[]> => {
  const rows = await apiData<Product[]>(
    apiClient.get(API_ENDPOINTS.products.list)
  )
  return Array.isArray(rows) ? rows.map(withDerivedProductImages) : []
}

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const product = await apiData<Product>(
    apiClient.get(API_ENDPOINTS.products.bySlug(slug))
  )
  return withDerivedProductImages(product)
}

export const getCategories = async (): Promise<Category[]> => {
  return apiData(apiClient.get(API_ENDPOINTS.products.categories))
}
