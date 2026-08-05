export type AiSearchRequest = {
  category?: string
  gender?: string
  priceMin?: number
  priceMax?: number
  size?: string
  color?: string
  material?: string
  style?: string
  occasion?: string
  brand?: string
}

export type AiProductResult = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  imageUrl: string | null
  availableColors: string[]
  availableSizes: string[]
  material: string | null
  categoryName: string | null
  brand: string | null
  averageRating: number
  reviewCount: number
  stock: number
}

export type AiSearchResponse = {
  products: AiProductResult[]
  totalCount: number
}

export type ChatProduct = {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  imageUrl: string | null
  colors: string[]
  sizes: string[]
  averageRating: number
  reviewCount: number
  stock: number
}

export type ChatRecommendation = {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  imageUrl: string | null
  reason: string
}

export type ChatOrderStatus = {
  orderId: string
  status: string
  estimatedDelivery: string | null
  history: ChatOrderHistory[]
}

export type ChatOrderHistory = {
  status: string
  timestamp: string
}

export type ChatPromotion = {
  code: string
  description: string
  discountPercent: number | null
  discountAmount: number | null
  minOrderValue: number | null
}

export type ChatFaq = {
  question: string
  answer: string
}

export type ChatPolicy = {
  title: string
  content: string
}

export type ChatSizeGuide = {
  recommendedSize: string | null
  sizeGuide: SizeGuideRow[] | null
}

export type SizeGuideRow = {
  size: string
  height: string
  weight: string
  chest: string
  waist: string
}

export type ChatResponse = {
  reply: string
  products?: ChatProduct[]
  recommendations?: ChatRecommendation[]
  orderStatus?: ChatOrderStatus
  promotions?: ChatPromotion[]
  faqs?: ChatFaq[]
  policies?: ChatPolicy[]
  sizeGuide?: ChatSizeGuide
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: ChatProduct[]
  recommendations?: ChatRecommendation[]
  orderStatus?: ChatOrderStatus
  promotions?: ChatPromotion[]
  faqs?: ChatFaq[]
  shippingPolicy?: ChatPolicy[]
  returnPolicy?: ChatPolicy[]
  sizeRecommendation?: ChatSizeGuide
  loading?: boolean
}