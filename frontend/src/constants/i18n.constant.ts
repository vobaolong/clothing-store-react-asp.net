import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  CouponDiscountType,
  CouponStatus,
  CategoryGender,
  CategoryType
} from '@/enums'

export const VI_LABELS: Record<string, string> = {
  // Order Status
  [OrderStatus.PENDING]: 'Chờ xác nhận',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.SHIPPING]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.CANCELLED]: 'Đã hủy',

  // Payment Status
  [PaymentStatus.UNPAID]: 'Chưa thanh toán',
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',

  // Payment Method
  [PaymentMethod.COD]: 'COD (Thanh toán khi nhận hàng)',
  [PaymentMethod.VNPAY]: 'VNPay',

  // Coupon Discount Type
  [CouponDiscountType.PERCENT]: 'Phần trăm',
  [CouponDiscountType.FLAT]: 'Số tiền',

  // Coupon Status
  [CouponStatus.ACTIVE]: 'Kích hoạt',
  [CouponStatus.INACTIVE]: 'Ngưng',
  [CouponStatus.ARCHIVED]: 'Lưu trữ',

  // Category Gender
  [CategoryGender.MALE]: 'Nam',
  [CategoryGender.FEMALE]: 'Nữ',
  [CategoryGender.UNISEX]: 'Unisex',

  // Category Type
  [CategoryType.CLOTHING]: 'Quần áo',
  [CategoryType.SHOES]: 'Giày dép',
  [CategoryType.ACCESSORIES]: 'Phụ kiện',

  active: 'Kích hoạt',
  locked: 'Bị khóa',
  all: 'Tất cả'
}

export const getVietnameseLabel = (key: string) => VI_LABELS[key] ?? key
