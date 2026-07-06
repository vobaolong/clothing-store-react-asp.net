import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CategoryGender, CategoryType } from '@/enums'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import {
  createCouponDiscountTypeOptions,
  createOrderStatusOptions,
  createPaymentStatusOptions,
  createOptions
} from '@/utils/enum.utils'

export type AdminFilterOption = {
  label: string
  value: string
}

export const getAdminFilterOptions = (t: (key: string) => string) => ({
  orderStatus: [
    { label: t('order.orderStatus'), value: ADMIN_FILTER_ALL_VALUE },
    ...createOrderStatusOptions()
  ] as AdminFilterOption[],
  paymentStatus: [
    { label: t('order.paymentStatus'), value: ADMIN_FILTER_ALL_VALUE },
    ...createPaymentStatusOptions()
  ] as AdminFilterOption[],
  active: [
    { label: t('common.status'), value: ADMIN_FILTER_ALL_VALUE },
    { label: t('common.active'), value: 'true' },
    { label: t('common.inactive'), value: 'false' }
  ] as AdminFilterOption[],
  categoryGender: [
    {
      label: t('admin.categoryGenderLabel'),
      value: ADMIN_FILTER_ALL_VALUE
    },
    ...createOptions(Object.values(CategoryGender))
  ] as AdminFilterOption[],
  categoryType: [
    { label: t('admin.categoryTypeLabel'), value: ADMIN_FILTER_ALL_VALUE },
    ...createOptions(Object.values(CategoryType))
  ] as AdminFilterOption[],
  couponType: [
    { label: t('coupon.discountType'), value: ADMIN_FILTER_ALL_VALUE },
    ...createCouponDiscountTypeOptions()
  ] as AdminFilterOption[],
  couponStatus: [
    { label: t('common.status'), value: ADMIN_FILTER_ALL_VALUE },
    { label: t('common.active'), value: 'Active' },
    { label: t('common.inactive'), value: 'Inactive' },
    { label: t('coupon.archive'), value: 'Archived' }
  ] as AdminFilterOption[]
})

export const useAdminFilterOptions = () => {
  const { t } = useTranslation()

  return useMemo(
    () => getAdminFilterOptions((key: string) => t(key as never) as string),
    [t]
  )
}
