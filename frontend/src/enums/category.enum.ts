export const CategoryGender = {
  MALE: 'male',
  FEMALE: 'female',
  UNISEX: 'unisex',
  KID: 'kid'
} as const

export type CategoryGender =
  (typeof CategoryGender)[keyof typeof CategoryGender]

export const CategoryProductType = {
  CLOTHING: 'clothing',
  SHOES: 'shoes',
  ACCESSORIES: 'accessories'
} as const

export type CategoryProductType =
  (typeof CategoryProductType)[keyof typeof CategoryProductType]
