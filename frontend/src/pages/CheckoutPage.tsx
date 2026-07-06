import { InfoCircleOutlined } from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import LoadingOverlay from '@/components/checkout/LoadingOverlay'
import { lp } from '@/utils/language-path'
import ShippingAddressSection from '@/components/checkout/ShippingAddressSection'
import CouponSection from '@/components/checkout/CouponSection'
import PaymentSection from '@/components/checkout/PaymentSection'
import OrderSummary from '@/components/checkout/OrderSummary'
import ShippingAddressFormModal from '@/components/profile/ShippingAddressFormModal'
import { PaymentMethod } from '@/enums'
import { getAvailableCoupons } from '@/api/coupons-api'
import {
  getShippingAddresses,
  getShippingAddressPrefill
} from '@/api/addresses-api'
import { placeOrder } from '@/api/orders-api'
import { createVnPayUrl } from '@/api/payments-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { PENDING_VNPAY_CART_ITEMS_KEY } from '@/constants/order.constant'
import { CART_NOTE_MAX_LENGTH } from '@/constants/product.constant.tsx'
import { calculateFinalTotal } from '@/utils/checkout-utils'
import { getCartLineEffectivePrice } from '@/utils/product-pricing'
import { getAuthToken } from '@/state/auth/auth-session'
import {
  removePurchasedCartItems,
  selectSelectedCartItems
} from '@/state/cart-slice'
import type { CheckoutFormValues } from '@/types/checkout.type'
import { useCheckoutAddressModalState } from '@/hooks/useCheckoutAddressModalState'
import { useCheckoutCouponState } from '@/hooks/useCheckoutCouponState'

const checkoutSchema = z.object({
  fullName: z.string().optional(),
  email: z.email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  ward: z.string().optional(),
  street: z.string().optional(),
  label: z.enum(['Home', 'Office']).optional(),
  setAsDefault: z.boolean().optional(),
  paymentMethod: z.enum(PaymentMethod),
  shippingAddressId: z.string().optional(),
  couponCode: z.string().optional(),
  note: z.string().max(CART_NOTE_MAX_LENGTH).optional()
})

export default function CheckoutPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const items = useSelector(selectSelectedCartItems)
  const [nowMs] = useState(() => Date.now())
  const justPlacedOrderRef = useRef(false)

  useEffect(() => {
    if (items.length === 0 && !justPlacedOrderRef.current) {
      navigate(lp('/cart'), { replace: true })
    }
  }, [items.length, navigate])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = ''
      }
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    })
    return () => observer.disconnect()
  }, [])

  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`
  })

  const addressesQuery = useQuery({
    queryKey: QUERY_KEYS.shippingAddresses,
    queryFn: getShippingAddresses,
    enabled: Boolean(getAuthToken())
  })
  const prefillQuery = useQuery({
    queryKey: QUERY_KEYS.shippingAddressPrefill,
    queryFn: getShippingAddressPrefill,
    enabled: Boolean(getAuthToken())
  })
  const availableCouponsQuery = useQuery({
    queryKey: QUERY_KEYS.availableCoupons,
    queryFn: getAvailableCoupons
  })

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<CheckoutFormValues>({
      resolver: zodResolver(checkoutSchema),
      defaultValues: {
        fullName: '',
        email: '',
        phone: '',
        fullAddress: '',
        province: '',
        ward: '',
        street: '',
        label: undefined,
        setAsDefault: false,
        paymentMethod: PaymentMethod.COD,
        couponCode: '',
        note: ''
      }
    })

  const subtotal = items.reduce(
    (sum, item) => sum + getCartLineEffectivePrice(item, nowMs) * item.quantity,
    0
  )

  const {
    coupon,
    watchedCouponCode,
    handleCouponCodeChange,
    applyCouponByCode,
    handleRemoveCoupon
  } = useCheckoutCouponState({ control, getValues, setValue, subtotal })

  const prefilledName = prefillQuery.data?.fullName
  useEffect(() => {
    if (prefilledName) setValue('fullName', prefilledName)
  }, [prefilledName, setValue])

  const defaultAddress = addressesQuery.data?.find((x) => x.isDefault)
  useEffect(() => {
    if (defaultAddress) {
      reset({
        ...getValues(),
        shippingAddressId: defaultAddress.id,
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        fullAddress: defaultAddress.fullAddress
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAddress])

  const appliedCouponDetails = availableCouponsQuery.data?.find(
    (c) => c.code.toUpperCase() === coupon.appliedCode
  )
  const isAppliedCouponEligible = appliedCouponDetails
    ? subtotal >= appliedCouponDetails.minOrderSubtotal
    : true
  const finalTotal = calculateFinalTotal(subtotal, coupon.discountAmount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    editingAddress,
    isAddressModalOpen,
    handleOpenAddAddress,
    handleEditAddress,
    handleCloseAddressModal,
    handleAddressModalSaved
  } = useCheckoutAddressModalState({
    queryClient,
    setValue
  })

  const submitOrder = async () => {
    if (isSubmitting) return
    if (!getAuthToken()) {
      toast.error(t('checkout.pleaseLogin'))
      navigate(lp('/login'))
      return
    }
    if (items.length === 0) {
      toast.error(t('checkout.cartEmpty'))
      return
    }

    try {
      setIsSubmitting(true)
      if (
        watchedCouponCode?.trim() &&
        watchedCouponCode.trim().toUpperCase() !== coupon.appliedCode
      ) {
        toast.error(t('checkout.pleaseApplyCoupon'))
        return
      }
      if (!isAppliedCouponEligible) {
        toast.error(t('checkout.insufficientTotal'))
        return
      }

      const values = getValues()
      if (!values.shippingAddressId) {
        toast.error(t('checkout.pleaseSelectAddress'))
        return
      }

      const orderItems = items.map((item) => {
        const productVariantId =
          item.productVariantId || item.selectedVariant?.id
        if (!productVariantId) {
          throw new Error(
            i18n.t('checkout.invalidProduct', { name: item.name ?? item.id })
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
        couponCode: coupon.appliedCode || undefined,
        shippingAddressId: values.shippingAddressId,
        paymentMethod: values.paymentMethod,
        note: noteTrimmed ? noteTrimmed : undefined,
        idempotencyKey
      })

      if (values.paymentMethod === PaymentMethod.VNPAY) {
        sessionStorage.setItem(
          PENDING_VNPAY_CART_ITEMS_KEY,
          JSON.stringify(
            orderItems.map((item) => ({
              id: item.productId,
              productVariantId: item.productVariantId
            }))
          )
        )
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
        t('checkout.orderSuccess', { orderId: orderId.slice(0, 8).toUpperCase() })
      )
      justPlacedOrderRef.current = true
      navigate(lp(`/orders/${orderId}`))
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : t('checkout.orderFailedMsg')
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = () => handleSubmit(submitOrder)()

  return (
    <div>
      <LoadingOverlay isSubmitting={isSubmitting} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('payment.payment')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
          <InfoCircleOutlined className="mr-1 text-slate-500 dark:text-gray-400" />
          {t('checkout.completeInfo')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_500px] items-start">
        <div className="space-y-4!">
          <ShippingAddressSection
            control={control}
            addressesQuery={addressesQuery}
            onOpenModal={handleOpenAddAddress}
            onEditAddress={handleEditAddress}
            qc={queryClient}
          />

          <CouponSection
            control={control}
            availableCouponsQuery={availableCouponsQuery}
            coupon={coupon}
            applyCouponByCode={applyCouponByCode}
            handleCouponCodeChange={handleCouponCodeChange}
            handleRemoveCoupon={handleRemoveCoupon}
            watchedCouponCode={watchedCouponCode}
            subtotal={subtotal}
          />

          <PaymentSection
            control={control}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <OrderSummary
          items={items}
          nowMs={nowMs}
          subtotal={subtotal}
          finalTotal={finalTotal}
          discountAmount={coupon.discountAmount}
          rawTotal={subtotal}
          appliedCouponCode={coupon.appliedCode || undefined}
        />
      </div>

      <ShippingAddressFormModal
        open={isAddressModalOpen}
        address={editingAddress}
        onCancel={handleCloseAddressModal}
        onSaved={handleAddressModalSaved}
      />
    </div>
  )
}
