import { useReducer } from 'react'
import { useWatch } from 'react-hook-form'
import i18n from 'i18next'
import type {
  Control,
  UseFormGetValues,
  UseFormSetValue
} from 'react-hook-form'
import toast from 'react-hot-toast'
import { validateCoupon } from '@/api/coupons-api'
import { normalizeCouponCode } from '@/utils/checkout-utils'
import type { CheckoutFormValues } from '@/types/checkout.type'

type CouponState = {
  isApplying: boolean
  appliedCode: string
  discountAmount: number
}

type CouponAction =
  | { type: 'applying'; value: boolean }
  | { type: 'set'; appliedCode: string; discountAmount: number }
  | { type: 'clear' }

const initialState: CouponState = {
  isApplying: false,
  appliedCode: '',
  discountAmount: 0
}

function reducer(state: CouponState, action: CouponAction): CouponState {
  switch (action.type) {
    case 'applying':
      return { ...state, isApplying: action.value }
    case 'set':
      return {
        isApplying: false,
        appliedCode: action.appliedCode,
        discountAmount: action.discountAmount
      }
    case 'clear':
      return initialState
    default:
      return state
  }
}

type Params = {
  control: Control<CheckoutFormValues>
  getValues: UseFormGetValues<CheckoutFormValues>
  setValue: UseFormSetValue<CheckoutFormValues>
  subtotal: number
}

export function useCheckoutCouponState({
  control,
  getValues,
  setValue,
  subtotal
}: Params) {
  const [coupon, dispatch] = useReducer(reducer, initialState)
  const watchedCouponCode = useWatch({ control, name: 'couponCode' })

  const handleCouponCodeChange = (nextCode: string) => {
    setValue('couponCode', nextCode)
    const normalized = normalizeCouponCode(nextCode)
    if (
      !normalized ||
      (coupon.appliedCode && normalized !== coupon.appliedCode)
    ) {
      dispatch({ type: 'clear' })
    }
  }

  const applyCouponByCode = async (inputCode?: string) => {
    const rawCode = inputCode?.trim() || getValues('couponCode')?.trim()
    if (!rawCode) {
      toast.error(i18n.t('message.error.enterCouponCode'))
      return
    }

    const normalizedCode = normalizeCouponCode(rawCode)
    if (coupon.isApplying) return
    if (coupon.appliedCode && coupon.appliedCode === normalizedCode) return

    try {
      dispatch({ type: 'applying', value: true })
      const result = await validateCoupon({
        code: rawCode,
        orderTotal: subtotal
      })
      const finalCode = normalizeCouponCode(result.code)
      dispatch({
        type: 'set',
        appliedCode: finalCode,
        discountAmount: result.discountAmount
      })
      setValue('couponCode', finalCode)
      toast.success(i18n.t('message.error.couponApplied'))
    } catch {
      dispatch({ type: 'clear' })
      toast.error(i18n.t('message.error.couponInvalid'))
    }
  }

  const handleRemoveCoupon = () => {
    dispatch({ type: 'clear' })
    setValue('couponCode', '')
  }

  return {
    coupon,
    watchedCouponCode,
    handleCouponCodeChange,
    applyCouponByCode,
    handleRemoveCoupon
  }
}

export type CheckoutCouponState = ReturnType<typeof useCheckoutCouponState>
