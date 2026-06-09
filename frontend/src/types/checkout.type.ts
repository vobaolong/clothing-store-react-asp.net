import type { Control, UseFormSetValue } from 'react-hook-form'
import type { UseQueryResult, QueryClient } from '@tanstack/react-query'
import type { ShippingAddress } from '@/types'
import type { AvailableCoupon } from '@/types/coupon.type'
import type { PaymentMethod as PaymentMethodType } from '@/enums/payment.enum'
import type { ShippingAddressLabel } from '@/enums/shipping-address.enum'

export type SelectOption = { label: string; value: string }
export type CheckoutWardOption = SelectOption & { wardCode: string }

export type CheckoutFormValues = {
  fullName?: string
  email?: string
  phone?: string
  fullAddress?: string
  province?: string
  ward?: string
  street?: string
  label?: ShippingAddressLabel
  setAsDefault?: boolean
  paymentMethod: PaymentMethodType
  shippingAddressId?: string
  couponCode?: string
  note?: string
}

export type AddressState = {
  showNewForm: boolean
  provinceOptions: SelectOption[]
  wardOptions: CheckoutWardOption[]
}

export type CouponState = {
  isApplying: boolean
  appliedCode: string
  discountAmount: number
}

export type ShippingAddressesQuery = UseQueryResult<ShippingAddress[]>
export type AvailableCouponsQuery = UseQueryResult<AvailableCoupon[]>

export type CheckoutPropsCommon = {
  control: Control<CheckoutFormValues>
  setValue: UseFormSetValue<CheckoutFormValues>
  qc: QueryClient
}
