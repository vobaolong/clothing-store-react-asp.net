export const ShippingAddressLabel = {
  HOME: 'Home',
  OFFICE: 'Office'
} as const

export type ShippingAddressLabel =
  (typeof ShippingAddressLabel)[keyof typeof ShippingAddressLabel]
