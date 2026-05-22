import { apiClient } from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { Product, Category } from '@/types'
import { withDerivedProductImages } from '@/utils/product-color-images'

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.products.list)
  const rows = data.data as Product[]
  return Array.isArray(rows) ? rows.map(withDerivedProductImages) : []
}

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const { data } = await apiClient.get(API_ENDPOINTS.products.bySlug(slug))
  return withDerivedProductImages(data.data as Product)
}

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.products.categories);
  return data.data;
};
