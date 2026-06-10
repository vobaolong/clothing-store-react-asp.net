import type { AdminProduct } from '@/types'
import type { ProductView } from '@/types'

export function getAdminProductThumbnail(product: AdminProduct) {
  const variants = Array.isArray(product.variants) ? product.variants : []
  const firstGalleryByVariantIndex = new Map<number, string>()

  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index]
    const firstGallery = Array.isArray(variant.imageUrls)
      ? variant.imageUrls.find((url) => url?.trim())
      : undefined
    if (firstGallery) firstGalleryByVariantIndex.set(index, firstGallery)
  }

  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index]
    const variantImage = variant.imageUrl?.trim()
    if (variantImage) return variantImage

    const variantGallery = firstGalleryByVariantIndex.get(index)
    if (variantGallery) return variantGallery
  }
  return null
}

export function buildAdminProductView(
  product: AdminProduct,
  updatedAt?: string | null
): ProductView {
  return {
    id: product.id,
    name: product.name,
    category: product.categoryName,
    description: product.description,
    price:
      product.salePrice != null && product.salePrice > 0
        ? product.salePrice
        : product.price,
    createdAt: product.createdAt,
    updatedAt: updatedAt ?? product.updatedAt ?? product.createdAt,
    imageUrl: getAdminProductThumbnail(product)
  }
}
