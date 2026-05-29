import type { ShippingAddressLabel } from '@/enums'

export type JwtPayload = {
  sub: string
  email: string
  fullName: string
  isAdmin?: boolean
  iat: number
  exp: number
}

export type MyProfile = {
  id: string
  email: string
  fullName: string
  phone: string
  isAdmin: boolean
}

export type ShippingAddress = {
  id: string
  fullName: string
  phone: string
  fullAddress?: string
  province: string
  provinceId: string
  ward: string
  wardCode: string
  street: string
  label?: ShippingAddressLabel | null
  isDefault: boolean
  createdAt: string
}

export type CreateShippingAddressPayload = {
  fullName: string
  phone: string
  address?: string
  province?: string
  provinceId?: string
  ward?: string
  wardCode?: string
  street?: string
  label?: ShippingAddressLabel
  isDefault?: boolean
}

export type UpdateShippingAddressPayload = CreateShippingAddressPayload
