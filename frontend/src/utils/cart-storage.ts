import type { CartItem } from '@/types'

function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    variants: Array.isArray(item.variants) ? item.variants : []
  }
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
  const compact = items.map((item) => compactCartItem(normalizeCartItem(item)))
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
    return (data as CartItem[]).map(normalizeCartItem)
  } catch {
    return []
  }
}
