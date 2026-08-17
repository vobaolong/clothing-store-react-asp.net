import { OrderStatus, CancellationRequestStatus } from '@/enums'

export type PlaceOrderPayload = {
  items: Array<{
    productId: string
    productVariantId: string
    quantity: number
  }>
  couponCode?: string
  shippingAddressId?: string
  paymentMethod?: string
  note?: string
  idempotencyKey?: string
}

export type CreateCancellationRequestPayload = {
  reason: string
  note?: string
}

export type CancellationRequest = {
  id: string
  reason: string
  note?: string | null
  status: CancellationRequestStatus
  createdAt: string
  reviewedAt?: string | null
  rejectionReason?: string | null
}

export type MyOrderItem = {
  id: string
  productId: string
  productName: string
  productSlug: string
  imageUrl: string
  productVariantId: string
  variantSize: string
  variantColor: string
  quantity: number
  unitPrice: number
  lineTotal: number
  hasReviewed?: boolean
  canReview?: boolean
}

export type MyOrder = {
  id: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: string
  paidAt?: string | null
  couponCodeSnapshot?: string | null
  discountAmount: number
  itemCount: number
  createdAt: string
}

export type MyOrderDetail = {
  id: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: string
  paidAt?: string | null
  paymentTransactionId?: string | null
  couponCodeSnapshot?: string | null
  discountAmount: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingProvince: string
  shippingProvinceId: string
  shippingWard: string
  shippingWardCode: string
  shippingStreet: string
  shippingLabel?: string | null
  createdAt: string
  note?: string | null
  updatedAt?: string
  statusHistories?: Array<{
    status: OrderStatus
    changedAt: string
  }>
  items: MyOrderItem[]
  cancellationRequest?: CancellationRequest | null
}
