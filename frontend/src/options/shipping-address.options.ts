import { ShippingAddressLabel } from '@/enums'

export const SHIPPING_ADDRESS_LABEL_OPTIONS = [
  {
    labelKey: 'checkout.home',
    value: ShippingAddressLabel.HOME
  },
  {
    labelKey: 'checkout.office',
    value: ShippingAddressLabel.OFFICE
  }
] as const
