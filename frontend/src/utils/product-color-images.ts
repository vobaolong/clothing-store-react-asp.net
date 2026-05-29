import type { Product } from '@/types'
import { normalizeSize } from '@/utils/size-utils'

function variantRowUrls(variant: Product['variants'][number]): string[] {
  const fromList = Array.isArray(variant.imageUrls)
    ? variant.imageUrls.map((u) => String(u).trim()).filter(Boolean)
    : []
  const one = variant.imageUrl?.trim()
  const row = fromList.length > 0 ? [...new Set(fromList)] : one ? [one] : []
  return row
}

function variantPrimaryUrl(variant: Product['variants'][number]): string {
  const row = variantRowUrls(variant)
  return row[0]?.trim() ?? ''
}

export function withDerivedProductImages<T extends Product>(product: T): T {
  // No longer derive product-level imageUrl/imageUrls from variants
  return product
}

function productFallbackGallery(): string[] {
  // No longer fallback to product-level images - return empty if no variant images
  return []
}

export function getCartLineImage(
  item: Pick<Product, 'variants'> & {
    productVariantId: string
    selectedColor: string
    selectedSize?: string
  }
): string {
  const variants = Array.isArray(item.variants) ? item.variants : []
  const vid = String(item.productVariantId ?? '').toLowerCase()

  const v =
    (vid
      ? variants.find((x) => String(x.id ?? '').toLowerCase() === vid)
      : undefined) ??
    (item.selectedColor?.trim() && item.selectedSize !== undefined
      ? variants.find(
          (x) =>
            (x.color ?? '').trim() === item.selectedColor.trim() &&
            normalizeSize(String(x.size ?? '')) ===
              normalizeSize(String(item.selectedSize ?? ''))
        )
      : undefined)

  if (v) {
    const u = variantPrimaryUrl(v)
    if (u) return u
  }

  // Try any variant with the selected color
  for (const variant of variants) {
    if ((variant.color ?? '').trim() === (item.selectedColor ?? '').trim()) {
      const u = variantPrimaryUrl(variant)
      if (u) return u
    }
  }

  // Fallback to first variant with any image
  for (const variant of variants) {
    const u = variantPrimaryUrl(variant)
    if (u) return u
  }

  return ''
}

export function getGalleryUrlsForColor(
  product: Product,
  color: string | undefined | null
): string[] {
  const trimmedColor = color?.trim()
  if (!trimmedColor) return productFallbackGallery()

  const urls: string[] = []
  const seen = new Set<string>()
  const rows = Array.isArray(product.variants) ? product.variants : []
  for (const variant of rows) {
    if ((variant.color ?? '').trim() !== trimmedColor) continue
    const row = variantRowUrls(variant)
    for (const url of row) {
      if (url && !seen.has(url)) {
        seen.add(url)
        urls.push(url)
      }
    }
  }
  if (urls.length) return urls
  return productFallbackGallery()
}

export function getPrimaryImageForColor(
  product: Product,
  color: string | undefined | null
): string {
  const galleryUrls = getGalleryUrlsForColor(product, color)
  return galleryUrls[0] ?? ''
}
