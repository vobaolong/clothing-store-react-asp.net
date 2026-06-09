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
  Customer,
  Category,
  AdminProductImportResult,
  AdminBulkPermanentProductsResult,
  LockCustomerResponse
} from '@/types'
import { CategoryGender, CategoryType } from '@/enums'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'

// GET api/admin/products
export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const rows = await apiData<AdminProduct[]>(
    apiClient.get(API_ENDPOINTS.admin.products)
  )
  return rows.map((p) => ({
    ...p,
    isActive: typeof p.isActive === 'boolean' ? p.isActive : true
  }))
}

// GET api/admin/products/deleted
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

// POST api/admin/products/{id}/restore
export const restoreAdminProduct = async (id: string) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.productRestoreById(id)))

// POST api/admin/products/bulk-restore
export const bulkRestoreAdminProducts = async (payload: { ids: string[] }) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.productsBulkRestore, payload))

// POST api/admin/products
export const createAdminProduct = async (payload: AdminProductUpsertPayload) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.products, payload))

// POST api/admin/products/import
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

// POST api/admin/products/export
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

// PUT api/admin/products/{id}/active
export const updateAdminProductActive = async (
  id: string,
  payload: { isActive: boolean }
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.productActiveById(id), payload))

// PUT api/admin/products/bulk
export const bulkUpdateAdminProductsActive = async (payload: {
  ids: string[]
  isActive: boolean
}) => apiVoid(apiClient.put(API_ENDPOINTS.admin.productsBulk, payload))

// DELETE api/admin/products/bulk
export const bulkDeleteAdminProducts = async (payload: { ids: string[] }) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.productsBulk, { data: payload }))

// DELETE api/admin/products/{id}/permanent
export const deleteAdminProductPermanent = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.productPermanentById(id)))

// DELETE api/admin/products/bulk-permanent
export const bulkDeleteAdminProductsPermanent = async (
  ids: string[]
): Promise<AdminBulkPermanentProductsResult> => {
  return apiData(
    apiClient.delete(API_ENDPOINTS.admin.productsBulkPermanent, {
      data: ids
    })
  )
}

// Error handling
export const getAdminApiErrorMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined
  const body = error.response?.data as { message?: string } | undefined
  return typeof body?.message === 'string' ? body.message : undefined
}

// PUT api/admin/products/{id}
export const updateAdminProduct = async (
  id: string,
  payload: AdminProductUpsertPayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.productById(id), payload))

// DELETE api/admin/products/{id}
export const deleteAdminProduct = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.productById(id)))

// GET api/admin/categories
export const getAdminCategories = async (): Promise<AdminCategory[]> =>
  (
    await apiData<Category[]>(apiClient.get(API_ENDPOINTS.admin.categories))
  ).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    image: item.image,
    description: item.description ?? '',
    parentId: item.parentId ?? null,
    level: item.parentId ?? 0,
    gender: item.gender ?? CategoryGender.UNISEX,
    productType: item.productType ?? CategoryType.CLOTHING,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  })) as AdminCategory[]

// POST api/admin/categories
export const createAdminCategory = async (
  payload: AdminCategoryUpsertPayload
) => apiVoid(apiClient.post(API_ENDPOINTS.admin.categories, payload))

// PUT api/admin/categories/{id}
export const updateAdminCategory = async (
  id: string,
  payload: AdminCategoryUpsertPayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.categoryById(id), payload))

// DELETE api/admin/categories/{id}
export const deleteAdminCategory = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.categoryById(id)))

// PUT api/admin/categories/bulk
export const bulkUpdateCategoriesActive = async (payload: {
  ids: string[]
  isActive: boolean
}) => apiVoid(apiClient.put(API_ENDPOINTS.admin.categoriesBulk, payload))

// GET api/admin/orders
export const getAdminOrders = async (
  status: string = ADMIN_FILTER_ALL_VALUE
): Promise<{ orders: AdminOrder[]; counts: StatusCount[] }> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.orders, { params: { status } }))

// PUT api/admin/orders/{id}/status
export const updateAdminOrderStatus = async (
  id: string,
  payload: AdminOrderStatusUpdatePayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.orderStatusById(id), payload))

// PUT api/admin/orders/bulk/status
export const bulkUpdateAdminOrdersStatus = async (payload: {
  orderIds: string[]
  status: string
}) => apiVoid(apiClient.put(API_ENDPOINTS.admin.ordersBulkStatus, payload))

// GET api/admin/reviews
export const getAdminReviews = async (): Promise<Review[]> =>
  (
    await apiData<{ items: Review[] }>(
      apiClient.get(API_ENDPOINTS.admin.reviews)
    )
  ).items

// DELETE api/admin/reviews/{id}
export const deleteAdminReview = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.reviewById(id)))

// POST api/admin/reviews/bulk-delete
export const bulkDeleteAdminReviews = async (ids: string[]) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.reviewsBulkDelete, ids))
// GET api/admin/customers
export const getAdminCustomers = async (): Promise<Customer[]> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.customers))

// PUT api/admin/customers/{id}/lock
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

// PUT api/admin/customers/{id}/unlock
export const unlockAdminCustomer = async (id: string) =>
  apiVoid(apiClient.put(API_ENDPOINTS.admin.customerUnlockById(id)))

// GET api/admin/orders/{id}
export const getAdminOrderDetail = async (
  id: string
): Promise<AdminOrderDetail> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.orderById(id)))

// GET api/admin/banners
export const getAdminBanners = async (): Promise<AdminBanner[]> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.banners))

// POST api/admin/banners
export const createAdminBanner = async (payload: AdminBannerUpsertPayload) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.banners, payload))

// PUT api/admin/banners/{id}
export const updateAdminBanner = async (
  id: string,
  payload: AdminBannerUpsertPayload
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.bannerById(id), payload))

// DELETE api/admin/banners/{id}
export const deleteAdminBanner = async (id: string) =>
  apiVoid(apiClient.delete(API_ENDPOINTS.admin.bannerById(id)))

// PUT api/admin/banners/reorder
export const reorderAdminBanners = async (
  items: { id: string; displayOrder: number }[]
) => apiVoid(apiClient.put(API_ENDPOINTS.admin.bannersReorder, items))
