import { ShippingAddressLabel } from '@/enums'
import { SHIPPING_ADDRESS_LABELS } from '@/constants/labels.constant'

export const SHIPPING_ADDRESS_LABEL_OPTIONS = [
  {
    label: SHIPPING_ADDRESS_LABELS.HOME,
    value: ShippingAddressLabel.HOME
  },
  {
    label: SHIPPING_ADDRESS_LABELS.OFFICE,
    value: ShippingAddressLabel.OFFICE
  }
] as const