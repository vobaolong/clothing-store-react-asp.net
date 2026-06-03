import axios from 'axios'

import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type {
  AdminCategory,
  AdminProduct,
  AdminOrder,
  AdminBanner,
  AdminOrderDetail,
  StatusCount,
  AdminProductUpsertPayload,
  AdminCategoryUpsertPayload,
  AdminBannerUpsertPayload,
  AdminOrderStatusUpdatePayload,
  Review,
  Customer
} from '@/types'
import { CategoryGender, CategoryType } from '@/enums'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const rows = await apiData<AdminProduct[]>(
    apiClient.get(API_ENDPOINTS.admin.products)
  )
  return rows.map((p) => ({
    ...p,
    isActive: typeof p.isActive === 'boolean' ? p.isActive : true
  }))
}

export const getAdminDeletedProducts = async (): Promise<AdminProduct[]> => {
  const rows = await apiData<AdminProduct[]>(
    apiClient.get(API_ENDPOINTS.admin.productsDeleted)
  )
  return rows.map((p) => ({
    ...p,
    isActive: typeof p.isActive === 'boolean' ? p.isActive : true,
    deletedAt:
      typeof p.deletedAt === 'string'
        ? p.deletedAt
        : p.deletedAt != null
          ? String(p.deletedAt)
          : null
  }))
}

export const restoreAdminProduct = async (id: string) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.productRestoreById(id)))

export const bulkRestoreAdminProducts = async (payload: { ids: string[] }) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.productsBulkRestore, payload))

export const createAdminProduct = async (payload: AdminProductUpsertPayload) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.products, payload))

export type AdminProductImportResult = {
  totalRows: number
  totalProductsDetected: number
  productsImported: number
  variantsImported: number
  failedRows: number
  errors: Array<{ rowNumber: number; error: string }>
}

export const importAdminProducts = async (
  file: File
): Promise<AdminProductImportResult> => {
  const formData = new FormData()
  formData.append('file', file)
  return apiData(
    apiClient.post(API_ENDPOINTS.admin.productsImport, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  )
}

export const exportAdminProducts = async (ids: string[]): Promise<Blob> => {
  const response = await apiClient.post(
    API_ENDPOINTS.admin.productsExport,
    { ids },
    {
      responseType: 'blob'
    }
  )
  return response.data as Blob
}

export const updateAdminProductActive = async (
  id: string,
  payload: { isActive: boolean }
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.productActiveById(id), payload))

export const bulkUpdateAdminProductsActive = async (payload: {
  ids: string[]
  isActive: boolean
}) => apiVoid(apiClient.put(API_ENDPOINTS.admin.productsBulk, payload))

export const bulkDeleteAdminProducts = async (payload: { ids: string[] }) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.productsBulk, { data: payload }))

export const deleteAdminProductPermanent = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.productPermanentById(id)))

export type AdminBulkPermanentProductsResult = {
  deleted: number
  skippedDueToOrders: number
  skippedNotInTrash: number
}

export const bulkDeleteAdminProductsPermanent = async (
  ids: string[]
): Promise<AdminBulkPermanentProductsResult> => {
  return apiData(
    apiClient.delete(API_ENDPOINTS.admin.productsBulkPermanent, {
      data: ids
    })
  )
}

export const getAdminApiErrorMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined
  const body = error.response?.data as { message?: string } | undefined
  return typeof body?.message === 'string' ? body.message : undefined
}

export const updateAdminProduct = async (
  id: string,
  payload: AdminProductUpsertPayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.productById(id), payload))

export const deleteAdminProduct = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.productById(id)))

export const getAdminCategories = async (): Promise<AdminCategory[]> =>
  (
    await apiData<Array<Record<string, unknown>>>(
      apiClient.get(API_ENDPOINTS.admin.categories)
    )
  ).map((item) => ({
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    slug: String(item.slug ?? ''),
    image: String(item.image ?? ''),
    description: item.description ? String(item.description) : undefined,
    parentId: item.parentId ? String(item.parentId) : null,
    level: item.parentId ? 1 : 0,
    gender: item.gender
      ? String(item.gender).toLowerCase()
      : CategoryGender.UNISEX,
    productType: item.productType
      ? String(item.productType).toLowerCase()
      : CategoryType.CLOTHING,
    isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(
      item.updatedAt ?? item.createdAt ?? new Date().toISOString()
    )
  })) as AdminCategory[]

export const createAdminCategory = async (
  payload: AdminCategoryUpsertPayload
) => apiVoid(apiClient.post(API_ENDPOINTS.admin.categories, payload))

export const updateAdminCategory = async (
  id: string,
  payload: AdminCategoryUpsertPayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.categoryById(id), payload))

export const deleteAdminCategory = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.categoryById(id)))

export type AdminCategoryBulkCreatePayload = {
  items: Array<{ name: string; image?: string; description?: string }>
  parentId?: string | null
  gender?: string
  productType?: string
  isActive?: boolean
}

export const bulkCreateAdminCategories = async (
  payload: AdminCategoryBulkCreatePayload
) => apiVoid(apiClient.post(API_ENDPOINTS.admin.categoriesBulk, payload))

export const bulkUpdateCategoriesActive = async (payload: {
  ids: string[]
  isActive: boolean
}) => apiVoid(apiClient.put(API_ENDPOINTS.admin.categoriesBulk, payload))

export const getAdminOrders = async (
  status: string = ADMIN_FILTER_ALL_VALUE
): Promise<{ orders: AdminOrder[]; counts: StatusCount[] }> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.orders, { params: { status } }))

export const updateAdminOrderStatus = async (
  id: string,
  payload: AdminOrderStatusUpdatePayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.orderStatusById(id), payload))

export const bulkUpdateAdminOrdersStatus = async (payload: {
  orderIds: string[]
  status: string
}) => apiVoid(apiClient.put(API_ENDPOINTS.admin.ordersBulkStatus, payload))

export const getAdminReviews = async (): Promise<Review[]> =>
  (
    await apiData<{ items: Review[] }>(
      apiClient.get(API_ENDPOINTS.admin.reviews)
    )
  ).items

export const deleteAdminReview = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.reviewById(id)))

export const bulkDeleteAdminReviews = async (ids: string[]) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.reviewsBulkDelete, ids))

export const getAdminCustomers = async (): Promise<Customer[]> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.customers))

export type LockCustomerResponse = {
  success: boolean
  message?: string
}

export const lockAdminCustomer = async (
  id: string,
  payload?: { reason?: string }
): Promise<LockCustomerResponse> => {
  const { data } = await apiClient.put(
    API_ENDPOINTS.admin.customerLockById(id),
    payload ?? {}
  )
  return data as LockCustomerResponse
}

export const unlockAdminCustomer = async (id: string) =>
  apiVoid(apiClient.put(API_ENDPOINTS.admin.customerUnlockById(id)))

export const getAdminOrderDetail = async (
  id: string
): Promise<AdminOrderDetail> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.orderById(id)))

export const getAdminBanners = async (): Promise<AdminBanner[]> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.banners))

export const createAdminBanner = async (payload: AdminBannerUpsertPayload) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.banners, payload))

export const updateAdminBanner = async (
  id: string,
  payload: AdminBannerUpsertPayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.bannerById(id), payload))

export const deleteAdminBanner = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.bannerById(id)))

export const reorderAdminBanners = async (
  items: { id: string; displayOrder: number }[]
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.bannersReorder, items))

export type {
  AdminCategory,
  AdminProduct,
  AdminOrder,
  AdminBanner,
  AdminOrderDetail,
  StatusCount,
  AdminProductUpsertPayload,
  AdminCategoryUpsertPayload,
  AdminBannerUpsertPayload,
  AdminOrderStatusUpdatePayload
}
