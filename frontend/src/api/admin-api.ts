import axios from 'axios'

import { apiClient } from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
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
import { CategoryGender, CategoryProductType, FilterStatus } from '@/enums'

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const rows = (await apiClient.get(API_ENDPOINTS.admin.products)).data
    .data as AdminProduct[]
  return rows.map((p) => ({
    ...p,
    isActive: typeof p.isActive === 'boolean' ? p.isActive : true
  }))
}

export const getAdminDeletedProducts = async (): Promise<AdminProduct[]> => {
  const rows = (await apiClient.get(API_ENDPOINTS.admin.productsDeleted)).data
    .data as AdminProduct[]
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
  apiClient.post(API_ENDPOINTS.admin.productRestoreById(id))

export const bulkRestoreAdminProducts = async (payload: { ids: string[] }) =>
  apiClient.post(API_ENDPOINTS.admin.productsBulkRestore, payload)

export const createAdminProduct = async (payload: AdminProductUpsertPayload) =>
  apiClient.post(API_ENDPOINTS.admin.products, payload)

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
  const res = await apiClient.post(API_ENDPOINTS.admin.productsImport, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data as AdminProductImportResult
}

export const updateAdminProductActive = async (
  id: string,
  payload: { isActive: boolean }
) => apiClient.put(API_ENDPOINTS.admin.productActiveById(id), payload)

export const bulkUpdateAdminProductsActive = async (payload: {
  ids: string[]
  isActive: boolean
}) => apiClient.put(API_ENDPOINTS.admin.productsBulk, payload)

export const bulkDeleteAdminProducts = async (payload: { ids: string[] }) =>
  apiClient.delete(API_ENDPOINTS.admin.productsBulk, { data: payload })

export const deleteAdminProductPermanent = async (id: string) =>
  apiClient.delete(API_ENDPOINTS.admin.productPermanentById(id))

export type AdminBulkPermanentProductsResult = {
  deleted: number
  skippedDueToOrders: number
  skippedNotInTrash: number
}

export const bulkDeleteAdminProductsPermanent = async (payload: {
  ids: string[]
}): Promise<AdminBulkPermanentProductsResult> => {
  const res = await apiClient.delete(
    API_ENDPOINTS.admin.productsBulkPermanent,
    {
      data: payload
    }
  )
  return res.data.data as AdminBulkPermanentProductsResult
}

export const getAdminApiErrorMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined
  const body = error.response?.data as { message?: string } | undefined
  return typeof body?.message === 'string' ? body.message : undefined
}

export const updateAdminProduct = async (
  id: string,
  payload: AdminProductUpsertPayload
) => apiClient.put(API_ENDPOINTS.admin.productById(id), payload)

export const deleteAdminProduct = async (id: string) =>
  apiClient.delete(API_ENDPOINTS.admin.productById(id))

export const getAdminCategories = async (): Promise<AdminCategory[]> =>
  (
    (await apiClient.get(API_ENDPOINTS.admin.categories)).data.data as Array<
      Record<string, unknown>
    >
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
      : CategoryProductType.CLOTHING,
    isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(
      item.updatedAt ?? item.createdAt ?? new Date().toISOString()
    )
  })) as AdminCategory[]

export const createAdminCategory = async (
  payload: AdminCategoryUpsertPayload
) => apiClient.post(API_ENDPOINTS.admin.categories, payload)

export const updateAdminCategory = async (
  id: string,
  payload: AdminCategoryUpsertPayload
) => apiClient.put(API_ENDPOINTS.admin.categoryById(id), payload)

export const deleteAdminCategory = async (id: string) =>
  apiClient.delete(API_ENDPOINTS.admin.categoryById(id))

export type AdminCategoryBulkCreatePayload = {
  items: Array<{ name: string; image?: string; description?: string }>
  parentId?: string | null
  gender?: string
  productType?: string
  isActive?: boolean
}

export const bulkCreateAdminCategories = async (
  payload: AdminCategoryBulkCreatePayload
) => apiClient.post(API_ENDPOINTS.admin.categoriesBulk, payload)

export const bulkUpdateCategoriesActive = async (payload: {
  ids: string[]
  isActive: boolean
}) => apiClient.put(API_ENDPOINTS.admin.categoriesBulk, payload)

export const getAdminOrders = async (
  status: string = FilterStatus.ALL
): Promise<{ orders: AdminOrder[]; counts: StatusCount[] }> =>
  (await apiClient.get(API_ENDPOINTS.admin.orders, { params: { status } })).data
    .data

export const updateAdminOrderStatus = async (
  id: string,
  payload: AdminOrderStatusUpdatePayload
) => apiClient.put(API_ENDPOINTS.admin.orderStatusById(id), payload)

export const bulkUpdateAdminOrdersStatus = async (
  payload: { orderIds: string[]; status: string }
) => apiClient.put(API_ENDPOINTS.admin.ordersBulkStatus, payload)

export const getAdminReviews = async (): Promise<Review[]> =>
  (await apiClient.get(API_ENDPOINTS.admin.reviews)).data.data.items

export const deleteAdminReview = async (id: string) =>
  apiClient.delete(API_ENDPOINTS.admin.reviewById(id))

export const getAdminCustomers = async (): Promise<Customer[]> =>
  (await apiClient.get(API_ENDPOINTS.admin.customers)).data.data

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
  apiClient.put(API_ENDPOINTS.admin.customerUnlockById(id))

export const getAdminOrderDetail = async (
  id: string
): Promise<AdminOrderDetail> =>
  (await apiClient.get(API_ENDPOINTS.admin.orderById(id))).data.data

export const getAdminBanners = async (): Promise<AdminBanner[]> =>
  (await apiClient.get(API_ENDPOINTS.admin.banners)).data.data

export const createAdminBanner = async (payload: AdminBannerUpsertPayload) =>
  apiClient.post(API_ENDPOINTS.admin.banners, payload)

export const updateAdminBanner = async (
  id: string,
  payload: AdminBannerUpsertPayload
) => apiClient.put(API_ENDPOINTS.admin.bannerById(id), payload)

export const deleteAdminBanner = async (id: string) =>
  apiClient.delete(API_ENDPOINTS.admin.bannerById(id))

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
