import type { Product } from '@/types'
import type { CartItem } from '@/types/cart.type'

// effective price helpers

export function isWithinSalePeriodAt(product: Product, nowMs: number): boolean {
  if (!product.salePriceStartDate && !product.salePriceEndDate) {
    return true
  }

  const now = new Date(nowMs)

  if (product.salePriceStartDate && product.salePriceEndDate) {
    const startDate = new Date(product.salePriceStartDate)
    const endDate = new Date(product.salePriceEndDate)
    return now >= startDate && now <= endDate
  }

  if (product.salePriceStartDate) {
    const startDate = new Date(product.salePriceStartDate)
    return now >= startDate
  }

  if (product.salePriceEndDate) {
    const endDate = new Date(product.salePriceEndDate)
    return now <= endDate
  }

  return false
}

export function isWithinSalePeriod(product: Product): boolean {
  return isWithinSalePeriodAt(product, Date.now())
}

export function getEffectivePriceAt(product: Product, nowMs: number): number {
  if (product.salePrice == null || product.salePrice >= product.price) {
    return product.price
  }
  if (!isWithinSalePeriodAt(product, nowMs)) {
    return product.price
  }
  if (product.salePriceEndDate) {
    const endMs = new Date(product.salePriceEndDate).getTime()
    if (nowMs >= endMs) {
      return product.price
    }
  }
  return product.salePrice!
}

export function getEffectivePrice(product: Product): number {
  return getEffectivePriceAt(product, Date.now())
}

export function getDiscountPercentage(product: Product): number {
  if (product.price === 0 || product.salePrice === null) {
    return 0
  }
  const effective = getEffectivePrice(product)
  if (effective >= product.price) {
    return 0
  }
  return Math.round(((product.price - effective) / product.price) * 100)
}

export function getCartLineEffectivePrice(
  line: CartItem,
  nowMs?: number
): number {
  return getEffectivePriceAt(line, nowMs ?? Date.now())
}
