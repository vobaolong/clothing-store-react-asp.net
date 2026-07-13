export type Product = {
  id: string
  name: string
  productCode: string
  slug: string
  description: string
  descriptionData: string
  price: number
  salePrice?: number | null
  salePriceStartDate?: string | null
  salePriceEndDate?: string | null
  stock: number
  totalAvailable: number
  soldCount: number
  averageRating: number
  reviewCount: number
  categoryId: string
  categoryName: string
  category?: string
  categorySlug?: string
  categoryBreadcrumbs?: Array<{
    id: string
    name: string
    slug: string
  }>
  variants: Array<{
    id: string
    sku: string
    size: string
    color: string
    hex: string
    quantity: number
    imageUrl?: string | null
    imageUrls?: string[] | null
  }>
  createdAt: string
}

export type Category = {
  id: string
  name: string
  slug: string
  image?: string | null
  description?: string | null
  parentId?: string | null
  level?: number
  gender?: string | null
  productType?: string | null
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

export type DescriptionLayout = {
  specs?: Array<{ label: string; value: string }>
  sizeGuide?: {
    profile?: 'Tops' | 'Bottoms'
    gender?: 'Male' | 'Female' | 'Unisex'
    rows?: Array<{
      size: string
      height?: string
      weight?: string
      chest?: string
      waist?: string
      footLength?: string
    }>
  }
}

export type ProductSelection = {
  color?: string | undefined
  size?: string | undefined
  quantity: number
  image: string
}

export type SizeGuideItem = {
  size: string
  weight: string
  height: string
  length: string
  waist: string
  hip: string
  thigh: string
  leg: string
}

export type ProductFormValues = {
  name: string
  productCode: string
  description: string
  measurementProfile?: 'Tops' | 'Bottoms' | 'Shoes'
  sizeGuideGender?: 'Male' | 'Female' | 'Unisex'
  sizeGuidePresetProfile?: 'Tops' | 'Bottoms' | 'Shoes'
  sizeGuideRows: Array<{
    size: string
    height?: string
    weight?: string
    chest?: string
    waist?: string
    footLength?: string
  }>
  isActive?: boolean
  descriptionSpecs: Array<{ label: string; value: string[] }>
  categoryId: string
  price: number
  salePrice?: number | null
  variants: Array<{
    sku?: string
    size: string
    color: string
    hex: string
    quantity: number
    price?: number | null
    imageUrl?: string | null
    imageUrls?: string[] | null
    isActive?: boolean
  }>
}
