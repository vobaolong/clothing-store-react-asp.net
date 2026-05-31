import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  CouponDiscountType,
  CouponStatus,
  CategoryGender,
  CategoryProductType
} from '@/enums'

export const VI_LABELS: Record<string, string> = {
  // Order Status
  [OrderStatus.PENDING.toLowerCase()]: 'Chờ xác nhận',
  [OrderStatus.CONFIRMED.toLowerCase()]: 'Đã xác nhận',
  [OrderStatus.SHIPPING.toLowerCase()]: 'Đang giao',
  [OrderStatus.DELIVERED.toLowerCase()]: 'Đã giao',
  [OrderStatus.CANCELLED.toLowerCase()]: 'Đã hủy',

  // Payment Status
  [PaymentStatus.UNPAID.toLowerCase()]: 'Chưa thanh toán',
  [PaymentStatus.PAID.toLowerCase()]: 'Đã thanh toán',
  [PaymentStatus.REFUNDED.toLowerCase()]: 'Đã hoàn tiền',

  // Payment Method
  [PaymentMethod.COD.toLowerCase()]: 'COD (Thanh toán khi nhận hàng)',
  [PaymentMethod.VNPAY.toLowerCase()]: 'VNPay',

  // Coupon Discount Type
  [CouponDiscountType.PERCENT.toLowerCase()]: 'Phần trăm',
  [CouponDiscountType.FLAT.toLowerCase()]: 'Số tiền',

  // Coupon Status
  [CouponStatus.ACTIVE.toLowerCase()]: 'Kích hoạt',
  [CouponStatus.INACTIVE.toLowerCase()]: 'Ngưng',
  [CouponStatus.ARCHIVED.toLowerCase()]: 'Lưu trữ',

  // Category Gender
  [CategoryGender.MALE]: 'Nam',
  [CategoryGender.FEMALE]: 'Nữ',
  [CategoryGender.UNISEX]: 'Unisex',
  [CategoryGender.KID]: 'Trẻ em',

  // Category Type
  [CategoryProductType.CLOTHING]: 'Quần áo',
  [CategoryProductType.SHOES]: 'Giày dép',
  [CategoryProductType.ACCESSORIES]: 'Phụ kiện',

  // Customer Status
  active: 'Kích hoạt',
  locked: 'Bị khóa',
  // General
  all: 'Tất cả'
}

export const getVietnameseLabel = (key: string) =>
  VI_LABELS[key.toLowerCase()] ?? key
