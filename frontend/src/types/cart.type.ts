import type { Product } from '@/types/product.type'

export type CartItem = Product & {
  selectedVariant: {
    id: string
    size: string
    color: string
    hex: string
  }
  productVariantId: string
  selectedSize: string
  selectedColor: string
  isSelected: boolean
  quantity: number
}

export type CartState = {
  items: CartItem[]
  isDrawerOpen: boolean
}
