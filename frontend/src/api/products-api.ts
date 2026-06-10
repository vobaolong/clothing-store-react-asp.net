import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type { Product, Category } from '@/types'

export const getProducts = async (): Promise<Product[]> => {
  const rows = await apiData<Product[]>(
    apiClient.get(API_ENDPOINTS.products.list)
  )
  return Array.isArray(rows) ? rows : []
}

export const getProductBySlug = async (slug: string): Promise<Product> => {
  return apiData<Product>(apiClient.get(API_ENDPOINTS.products.bySlug(slug)))
}

export const getCategories = async (): Promise<Category[]> => {
  return apiData(apiClient.get(API_ENDPOINTS.products.categories))
}
