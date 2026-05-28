export type ProductReview = {
  id: string
  userId: string
  userName: string
  rating: number
  comment?: string | null
  createdAt: string
  updatedAt: string
  tags?: string[] | null
  variantSize?: string | null
  variantColor?: string | null
}

export type ProductReviews = {
  productId: string
  averageRating: number
  totalCount: number
  reviews: ProductReview[]
  canReview: boolean
  eligibilityMessage?: string | null
}
