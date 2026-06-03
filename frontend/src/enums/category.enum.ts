export const CategoryGender = {
  MALE: 'Male',
  FEMALE: 'Female',
  UNISEX: 'Unisex'
} as const

export type CategoryGender =
  (typeof CategoryGender)[keyof typeof CategoryGender]

export const CategoryType = {
  CLOTHING: 'Clothing',
  SHOES: 'Shoes',
  ACCESSORIES: 'Accessories'
} as const

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType]
