import type { CartItem } from '@/types'
import { normalizeSize } from '@/utils/size-utils'

function normalizeCartItem(item: Partial<CartItem>): CartItem | null {
  const variants = Array.isArray(item.variants) ? item.variants : []
  const selectedVariant =
    item.selectedVariant ??
    variants.find((variant) => variant.id === item.productVariantId) ??
    (item.selectedColor && item.selectedSize
      ? variants.find(
          (variant) =>
            variant.color === item.selectedColor &&
            normalizeSize(variant.size) ===
              normalizeSize(item.selectedSize ?? '')
        )
      : undefined)

  if (!item.id || !selectedVariant) return null

  const normalizedItem = {
    ...item,
    id: item.id,
    variants,
    selectedVariant: {
      id: selectedVariant.id,
      size: selectedVariant.size,
      color: selectedVariant.color,
      hex: selectedVariant.hex
    },
    productVariantId: selectedVariant.id,
    selectedSize: selectedVariant.size,
    selectedColor: selectedVariant.color,
    isSelected: item.isSelected ?? true,
    quantity: Math.max(1, item.quantity ?? 1)
  } as CartItem

  return normalizedItem
}

function compactCartItem(item: CartItem): CartItem {
  return {
    ...item,
    description: '',
    descriptionData: '',
    categoryBreadcrumbs: undefined
  }
}

export function saveCartItemsToStorage(items: CartItem[]) {
  const compact = items
    .map((item) => normalizeCartItem(item))
    .filter((item): item is CartItem => item !== null)
    .map((item) => compactCartItem(item))
  try {
    localStorage.setItem('cart_items', JSON.stringify(compact))
  } catch {
    try {
      const minimal = compact.map((item) => ({
        ...item,
        variants: item.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          hex: v.hex,
          quantity: v.quantity,
          imageUrl: v.imageUrl ?? null,
          imageUrls:
            Array.isArray(v.imageUrls) && v.imageUrls.length > 0
              ? [
                  ...new Set(
                    v.imageUrls.map((u) => String(u).trim()).filter(Boolean)
                  )
                ]
              : undefined
        }))
      }))
      localStorage.setItem('cart_items', JSON.stringify(minimal))
    } catch {
      try {
        localStorage.removeItem('cart_items')
      } catch {
        /* quota / private mode */
      }
    }
  }
}

export function loadCartItemsFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem('cart_items')
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data
      .map((item) => normalizeCartItem(item as Partial<CartItem>))
      .filter((item): item is CartItem => item !== null)
  } catch {
    return []
  }
}
