export type CategoryRadarData = {
  categoryName: string
  value: number
}

export type OrderOverview = {
  id: string
  customerEmail: string
  totalAmount: number
  status: string
  createdAt: string
}

export type AnalyticsPoint = {
  date: string
  revenue: number
}

export type Review = {
  id: string
  userName: string
  productName: string
  rating: number
  comment: string
  createdAt: string
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  status: 'active' | 'locked'
}

export type ProductView = {
  id: string
  name: string
  category: string
  description: string
  price: number
  createdAt: string
  updatedAt: string
  imageUrl?: string | null
}
