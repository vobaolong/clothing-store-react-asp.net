export const PaymentMethod = {
  COD: 'COD',
  VNPAY: 'VNPAY'
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const PaymentStatus = {
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  REFUNDED: 'Refunded'
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
