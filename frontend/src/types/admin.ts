import type { CategoryGender, CategoryProductType } from '@/enums'

export type AdminCategory = {
  id: string
  name: string
  slug: string
  image: string
  description?: string
  parentId: string | null
  level: 0 | 1
  gender: CategoryGender
  productType?: CategoryProductType
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminProduct = {
  id: string
  productCode: string
  slug: string
  name: string
  description: string
  descriptionData: string
  price: number
  stock: number
  isActive: boolean
  categoryId: string
  categoryName: string
  salePrice: number
  salePriceStartDate: string
  salePriceEndDate: string
  soldCount?: number

  variants: Array<{
    id: string
    sku: string
    size: string
    color: string
    hex: string
    price?: number | null
    quantity: number
    imageUrl?: string | null
    imageUrls?: string[] | null
    isActive?: boolean
  }>
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type AdminOrder = {
  id: string
  userId: string
  userEmail: string
  totalAmount: number
  status: string
  paymentStatus: string
  itemCount: number
  createdAt: string
  updatedAt?: string
  note?: string | null
}

export type AdminBanner = {
  id: string
  imageUrl: string
  ctaLink: string
  isActive: boolean
  startsAt?: string | null
  endsAt?: string | null
  createdAt: string
}

export type AdminOrderDetail = {
  id: string
  userId: string
  userName: string
  userEmail: string
  createdAt: string
  updatedAt?: string
  status: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  paidAt?: string | null
  couponCodeSnapshot?: string | null
  couponDiscountTypeSnapshot?: string | null
  couponDiscountValueSnapshot?: number | null
  discountAmount: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingProvince: string
  shippingProvinceId: string
  shippingDistrict: string
  shippingDistrictId: string
  shippingWard: string
  shippingWardCode: string
  shippingStreet: string
  shippingLabel?: string | null
  note?: string | null
  statusHistories?: Array<{ status: string; changedAt: string }>
  items: Array<{
    id: string
    productId: string
    productName: string
    productVariantId: string
    variantSize: string
    variantColor: string
    imageUrl: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}

export type StatusCount = { status: string; count: number }

export type AdminProductVariantPayload = {
  sku?: string
  size: string
  color: string
  hex: string
  price?: number | null
  quantity: number
  imageUrl?: string | null
  imageUrls?: string[] | null
  isActive?: boolean
}

export type AdminProductUpsertPayload = {
  name: string
  productCode: string
  description: string
  descriptionData: string
  price: number
  salePrice?: number | null
  salePriceStartDate?: string | null
  salePriceEndDate?: string | null
  categoryId: string
  variants: AdminProductVariantPayload[]
}

export type AdminCategoryUpsertPayload = {
  name: string
  image: string
  description?: string
  parentId?: string | null
  level?: number
  gender?: CategoryGender
  productType?: CategoryProductType
  isActive?: boolean
}

export type AdminBannerUpsertPayload = {
  imageUrl: string
  ctaLink: string
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
}

export type AdminOrderStatusUpdatePayload = {
  status: string
}
