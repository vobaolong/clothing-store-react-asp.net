import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { PaymentMethod } from '@/enums'
import { placeOrder } from '@/api/orders-api'
import { createVnPayUrl } from '@/api/payments-api'
import { removePurchasedCartItems } from '@/state/cart-slice'
import { getAuthToken } from '@/state/auth/auth-session'
import type { CartItem } from '@/types/cart.type'
import type { CheckoutFormValues } from '@/types/checkout.type'

type Params = {
  items: CartItem[]
  couponCode?: string
  watchedCouponCode?: string
  isAppliedCouponEligible: boolean
  getValues: () => CheckoutFormValues
  idempotencyKey: string
}

export function useCheckoutOrderSubmission({
  items,
  couponCode,
  watchedCouponCode,
  isAppliedCouponEligible,
  getValues,
  idempotencyKey
}: Params) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitOrder = async () => {
    if (isSubmitting) return
    if (!getAuthToken()) {
      toast.error('Vui lòng đăng nhập trước khi thanh toán')
      navigate('/login')
      return
    }
    if (items.length === 0) {
      toast.error('Giỏ hàng của bạn trống')
      return
    }

    try {
      setIsSubmitting(true)

      if (
        watchedCouponCode?.trim() &&
        watchedCouponCode.trim().toUpperCase() !== (couponCode ?? '')
      ) {
        toast.error('Vui lòng áp dụng mã giảm giá trước khi đặt hàng')
        return
      }

      if (!isAppliedCouponEligible) {
        toast.error('Tổng tiền hiện tại không đủ để áp dụng mã giảm giá')
        return
      }

      const values = getValues()
      if (!values.shippingAddressId) {
        toast.error('Vui lòng chọn địa chỉ giao hàng')
        return
      }

      const orderItems = items.map((item) => {
        const productVariantId =
          item.productVariantId || item.selectedVariant?.id
        if (!productVariantId) {
          throw new Error(
            `Giỏ hàng có sản phẩm không hợp lệ: ${item.name ?? item.id}`
          )
        }

        return {
          productId: item.id,
          productVariantId,
          quantity: item.quantity
        }
      })

      const noteTrimmed = values.note?.trim()
      const orderId = await placeOrder({
        items: orderItems,
        couponCode: couponCode || undefined,
        shippingAddressId: values.shippingAddressId,
        paymentMethod: values.paymentMethod,
        note: noteTrimmed ? noteTrimmed : undefined,
        idempotencyKey
      })

      if (values.paymentMethod === PaymentMethod.VNPAY) {
        const data = await createVnPayUrl(orderId)
        window.location.assign(data.paymentUrl)
        return
      }

      dispatch(
        removePurchasedCartItems(
          orderItems.map((item) => ({
            id: item.productId,
            productVariantId: item.productVariantId
          }))
        )
      )
      toast.success(
        <div>
          <div className="font-semibold">Đặt hàng thành công!</div>
          <div className="text-sm opacity-80">
            Mã đơn: {orderId.slice(0, 8).toUpperCase()}
          </div>
        </div>
      )
      navigate('/')
    } catch (error: unknown) {
      const msg =
        axios.isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data
          ? String((error.response.data as { message: unknown }).message)
          : 'Không thể đặt hàng. Vui lòng thử lại sau'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    submitOrder
  }
}

export type CheckoutOrderSubmissionState = ReturnType<
  typeof useCheckoutOrderSubmission
>
