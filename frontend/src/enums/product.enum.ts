export const ProductSize = {
  XS: 'XS',
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
  XXL: '2XL',
  XXXL: '3XL',
  XXXXL: '4XL'
} as const

export type ProductSize = (typeof ProductSize)[keyof typeof ProductSize]

export const HomeTabKey = {
  ALL: 'all',
  NEW: 'new',
  SALE: 'sale'
} as const

export type HomeTabKey = (typeof HomeTabKey)[keyof typeof HomeTabKey]
