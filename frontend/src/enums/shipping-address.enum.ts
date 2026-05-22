export const ShippingAddressLabel = {
  HOME: 'Home',
  OFFICE: 'Office'
} as const

export type ShippingAddressLabel =
  (typeof ShippingAddressLabel)[keyof typeof ShippingAddressLabel]

export const SHIPPING_ADDRESS_LABEL_OPTIONS = [
  { label: 'Nhà riêng', value: ShippingAddressLabel.HOME },
  { label: 'Văn phòng', value: ShippingAddressLabel.OFFICE }
] as const
