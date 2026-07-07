export type CartItemDto = {
  id: string
  productId: string
  productName: string
  productSlug: string
  productVariantId: string
  variantSku: string
  size: string
  color: string
  hex: string
  price: number
  salePrice: number | null
  salePriceStartDate: string | null
  salePriceEndDate: string | null
  quantity: number
  availableStock: number
  imageUrl: string | null
  imageUrls: string[]
}
