import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductSize,
  ProductShoeSize,
  CouponDiscountType
} from '@/enums'
import { getVietnameseLabel } from '@/constants/i18n.constant'

export const getOrderStatuses = () => Object.values(OrderStatus)
export const getPaymentMethods = () => Object.values(PaymentMethod)
export const getPaymentStatuses = () => Object.values(PaymentStatus)
export const getProductSizes = () => Object.values(ProductSize)
export const getProductShoeSizes = () => Object.values(ProductShoeSize)
export const getCouponDiscountTypes = () => Object.values(CouponDiscountType)

export const createOptions = (values: string[]) =>
  values.map((v) => ({
    label: getVietnameseLabel(v),
    value: v
  }))

export const createOrderStatusOptions = () => createOptions(getOrderStatuses())
export const createPaymentStatusOptions = () =>
  createOptions(getPaymentStatuses())
export const createPaymentMethodOptions = () =>
  createOptions(getPaymentMethods())
export const createCouponDiscountTypeOptions = () =>
  createOptions(getCouponDiscountTypes())
