import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useEffect, useReducer, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { z } from 'zod'
import { PaymentMethod } from '@/enums'
import {
  removePurchasedCartItems,
  selectSelectedCartItems
} from '@/state/cart-slice'
import { getAuthToken } from '@/state/auth-session'
import { placeOrder } from '@/api/orders-api'
import { getAvailableCoupons, validateCoupon } from '@/api/coupons-api'
import {
  createShippingAddress,
  getShippingAddresses,
  getShippingAddressPrefill
} from '@/api/addresses-api'
import { getProvinces, getWardsByProvinceCode } from '@/api/provinces-api'
import { createVnPayUrl } from '@/api/payments-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
  calculateFinalTotal,
  normalizeCouponCode
} from '@/utils/checkout-utils'
import { InfoCircleOutlined } from '@ant-design/icons'
import { getEffectivePriceAt } from '@/utils/product-pricing'
import LoadingOverlay from '@/components/checkout/LoadingOverlay'
import ShippingAddressSection from '@/components/checkout/ShippingAddressSection'
import CouponSection from '@/components/checkout/CouponSection'
import PaymentSection from '@/components/checkout/PaymentSection'
import OrderSummary from '@/components/checkout/OrderSummary'
import type {
  CheckoutFormValues,
  SelectOption,
  CheckoutWardOption
} from '@/features/checkout/types'

type CouponState = {
  isApplying: boolean
  appliedCode: string
  discountAmount: number
}

type AddressState = {
  showNewForm: boolean
  provinceOptions: SelectOption[]
  wardOptions: CheckoutWardOption[]
}

type CheckoutUiState = {
  coupon: CouponState
  address: AddressState
  isSubmitting: boolean
}

type CheckoutUiAction =
  | { type: 'coupon/applying'; value: boolean }
  | { type: 'coupon/set'; appliedCode: string; discountAmount: number }
  | { type: 'coupon/clear' }
  | { type: 'coupon/code-input' }
  | { type: 'address/toggle-new-form' }
  | { type: 'address/set-province-options'; options: SelectOption[] }
  | { type: 'address/set-ward-options'; options: CheckoutWardOption[] }
  | { type: 'address/hide-new-form' }
  | { type: 'submitting/set'; value: boolean }

const checkoutUiInitialState: CheckoutUiState = {
  coupon: {
    isApplying: false,
    appliedCode: '',
    discountAmount: 0
  },
  address: {
    showNewForm: false,
    provinceOptions: [],
    wardOptions: []
  },
  isSubmitting: false
}

function checkoutUiReducer(
  state: CheckoutUiState,
  action: CheckoutUiAction
): CheckoutUiState {
  switch (action.type) {
    case 'coupon/applying':
      return {
        ...state,
        coupon: { ...state.coupon, isApplying: action.value }
      }
    case 'coupon/set':
      return {
        ...state,
        coupon: {
          isApplying: false,
          appliedCode: action.appliedCode,
          discountAmount: action.discountAmount
        }
      }
    case 'coupon/clear':
      return {
        ...state,
        coupon: {
          isApplying: false,
          appliedCode: '',
          discountAmount: 0
        }
      }
    case 'coupon/code-input':
      return state
    case 'address/toggle-new-form':
      return {
        ...state,
        address: {
          ...state.address,
          showNewForm: !state.address.showNewForm
        }
      }
    case 'address/set-province-options':
      return {
        ...state,
        address: {
          ...state.address,
          provinceOptions: action.options
        }
      }
    case 'address/set-ward-options':
      return {
        ...state,
        address: {
          ...state.address,
          wardOptions: action.options
        }
      }
    case 'address/hide-new-form':
      return {
        ...state,
        address: {
          ...state.address,
          showNewForm: false
        }
      }
    case 'submitting/set':
      return {
        ...state,
        isSubmitting: action.value
      }
    default:
      return state
  }
}

const checkoutSchema = z.object({
  fullName: z.string().optional(),
  email: z.email('Invalid email').or(z.literal('')).optional(),
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
  note: z.string().max(2000).optional()
})

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const items = useSelector(selectSelectedCartItems)
  const [nowMs] = useState(() => Date.now())

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = ''
      }
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])
  const [uiState, uiDispatch] = useReducer(
    checkoutUiReducer,
    checkoutUiInitialState
  )
  const total = items.reduce((sum, item) => {
    const effective = getEffectivePriceAt(
      item as unknown as import('@/types').Product,
      nowMs
    )
    return sum + effective * item.quantity
  }, 0)
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
  const provincesQuery = useQuery({
    queryKey: QUERY_KEYS.checkoutProvinces,
    queryFn: () => getProvinces()
  })

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<CheckoutFormValues>({
      resolver: zodResolver(checkoutSchema),
      defaultValues: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
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

  const watchedCouponCode = useWatch({ control, name: 'couponCode' })
  const selectedProvinceCode = useWatch({ control, name: 'province' })

  const wardsByProvinceQuery = useQuery({
    queryKey: QUERY_KEYS.checkoutWardsByProvince(selectedProvinceCode),
    queryFn: () => getWardsByProvinceCode(String(selectedProvinceCode)),
    enabled: Boolean(selectedProvinceCode)
  })

  const subtotal = total
  const coupon = uiState.coupon
  const address = uiState.address
  const isSubmitting = uiState.isSubmitting
  const finalTotal = calculateFinalTotal(subtotal, coupon.discountAmount)
  const appliedCouponDetails = availableCouponsQuery.data?.find(
    (c) => c.code.toUpperCase() === coupon.appliedCode
  )
  const isAppliedCouponEligible = appliedCouponDetails
    ? subtotal >= appliedCouponDetails.minOrderSubtotal
    : true

  useEffect(() => {
    if (prefillQuery.data) setValue('fullName', prefillQuery.data.fullName)
  }, [prefillQuery.data, setValue])

  useEffect(() => {
    const defaultAddress = addressesQuery.data?.find((x) => x.isDefault)
    if (defaultAddress) {
      reset({
        ...getValues(),
        shippingAddressId: defaultAddress.id,
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        address: defaultAddress.address
      })
    }
  }, [addressesQuery.data, getValues, reset])

  const handleCouponCodeChange = (nextCode: string) => {
    setValue('couponCode', nextCode)
    const normalized = normalizeCouponCode(nextCode)
    if (
      !normalized ||
      (coupon.appliedCode && normalized !== coupon.appliedCode)
    ) {
      uiDispatch({ type: 'coupon/clear' })
    }
  }

  const applyCouponByCode = async (inputCode?: string) => {
    const rawCode = inputCode?.trim() || getValues('couponCode')?.trim()
    if (!rawCode) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }
    const normalizedCode = normalizeCouponCode(rawCode)
    if (coupon.isApplying) return
    if (coupon.appliedCode && coupon.appliedCode === normalizedCode) return
    try {
      uiDispatch({ type: 'coupon/applying', value: true })
      const result = await validateCoupon({
        code: rawCode,
        orderTotal: subtotal
      })
      const finalCode = normalizeCouponCode(result.code)
      uiDispatch({
        type: 'coupon/set',
        appliedCode: finalCode,
        discountAmount: result.discountAmount
      })
      setValue('couponCode', finalCode)
      toast.success('Đã áp dụng mã giảm giá')
    } catch {
      uiDispatch({ type: 'coupon/clear' })
      toast.error('Mã giảm giá không hợp lệ')
    }
  }

  const handleRemoveCoupon = () => {
    uiDispatch({ type: 'coupon/clear' })
    setValue('couponCode', '')
  }

  const handleSaveNewAddress = async () => {
    const values = getValues()
    const fullName = values.fullName?.trim() ?? ''
    const phone = values.phone?.trim() ?? ''
    const provinceCode = values.province?.trim() ?? ''
    const wardCode = values.ward?.trim() ?? ''
    const street = values.street?.trim() ?? values.address?.trim() ?? ''
    const label = values.label
    const province =
      provincesQuery.data?.find((x) => x.code === provinceCode)?.name ||
      address.provinceOptions.find((x) => x.value === provinceCode)?.label
    const ward =
      wardsByProvinceQuery.data?.find((x) => x.code === wardCode) ||
      address.wardOptions.find((x) => x.value === wardCode)
    const wardName = ward
      ? (('name' in ward ? ward.name : ward.label) as string)
      : ''
    const addressStr = [street, wardName, province].filter(Boolean).join(', ')
    if (!fullName || !phone || !province || !wardName || !street) {
      toast.error('Vui lòng chọn tỉnh, huyện và nhập địa chỉ')
      return
    }
    try {
      const addressId = await createShippingAddress({
        fullName,
        phone,
        address: addressStr,
        province,
        provinceId: provinceCode,
        district: '',
        districtId: '',
        ward: wardName,
        wardCode,
        street,
        label,
        isDefault: Boolean(values.setAsDefault)
      })
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.shippingAddresses })
      setValue('shippingAddressId', addressId)
      uiDispatch({ type: 'address/hide-new-form' })
      toast.success('Địa chỉ mới đã được thêm')
    } catch {
      toast.error('Không thể lưu địa chỉ mới')
    }
  }

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
      uiDispatch({ type: 'submitting/set', value: true })
      if (
        watchedCouponCode?.trim() &&
        normalizeCouponCode(watchedCouponCode) !== coupon.appliedCode
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
      const noteTrimmed = values.note?.trim()
      const orderId = await placeOrder({
        items: items.map((item) => ({
          productId: item.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity
        })),
        couponCode: coupon.appliedCode || undefined,
        shippingAddressId: values.shippingAddressId,
        paymentMethod: values.paymentMethod,
        note: noteTrimmed ? noteTrimmed : undefined,
        idempotencyKey
      })
      if (values.paymentMethod === 'VNPAY') {
        const data = await createVnPayUrl(orderId)
        window.location.assign(data.paymentUrl)
        return
      }
      dispatch(
        removePurchasedCartItems(
          items.map((item) => ({
            id: item.id,
            productVariantId: item.productVariantId
          }))
        )
      )
      const shortOrderId = orderId.slice(0, 8).toUpperCase()
      toast.custom(
        (t) => (
          <div
            className={`max-w-sm w-full rounded-2xl bg-white px-4 py-4 shadow-2xl border border-slate-200 transition-all duration-300 ${
              t.visible
                ? 'animate-in slide-in-from-right'
                : 'animate-out slide-out-to-right'
            }`}
          >
            <div className='flex items-start gap-3'>
              <div className='flex items-center justify-center bg-green-100 rounded-full size-10'>
                <svg
                  className='w-5 h-5 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={2}
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-slate-900'>
                  Xác nhận đặt hàng
                </p>
                <p className='mt-1 text-sm text-slate-600'>
                  Đặt hàng thành công 🎉
                </p>
                <p className='mt-1 text-xs text-slate-400'>
                  Mã đơn: <span className='font-medium'>{shortOrderId}</span>
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className='text-slate-400 hover:text-slate-600'
              >
                ✕
              </button>
            </div>
            <div className='flex items-center justify-end mt-4 gap-2'>
              <Button onClick={() => toast.dismiss(t.id)} className='text-sm'>
                Đóng
              </Button>
              <Button
                type='primary'
                onClick={() => {
                  toast.dismiss(t.id)
                  navigate(`/orders/${orderId}`)
                }}
                className='rounded-lg px-3 py-1.5 text-sm font-medium'
              >
                Xem đơn
              </Button>
            </div>
          </div>
        ),
        { duration: 50000 }
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
      uiDispatch({ type: 'submitting/set', value: false })
    }
  }

  const onSubmit = () => handleSubmit(submitOrder)()

  return (
    <div>
      <LoadingOverlay isSubmitting={isSubmitting} />
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-slate-900'>Thanh toán</h1>
        <p className='mt-1 text-sm text-slate-500'>
          <InfoCircleOutlined className='mr-1 text-slate-500' />
          Hoàn thành thông tin đặt hàng để tiếp tục.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1fr_500px] items-start'>
        <div className='space-y-4!'>
          <ShippingAddressSection
            control={control}
            addressesQuery={addressesQuery}
            addressState={address}
            onToggleNewForm={() =>
              uiDispatch({ type: 'address/toggle-new-form' })
            }
            handleSaveNewAddress={handleSaveNewAddress}
            qc={qc}
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
          total={total}
          appliedCouponCode={coupon.appliedCode || undefined}
        />
      </div>
    </div>
  )
}
