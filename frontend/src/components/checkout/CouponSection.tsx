import { Button, Card, Input } from 'antd'
import { Controller } from 'react-hook-form'
import AvailableCouponCard from '@/components/coupons/AvailableCouponCard'
import { CheckoutSectionTitle } from '@/components/checkout/CheckoutSectionTitle'
import type { Control } from 'react-hook-form'
import type {
  AvailableCouponsQuery,
  CouponState,
  CheckoutFormValues,
} from '@/types/checkout.type'
import type { AvailableCoupon } from '@/types/coupon.type'
import { formatCurrency } from '@/utils/format'

type Props = {
  control: Control<CheckoutFormValues>
  availableCouponsQuery: AvailableCouponsQuery
  coupon: CouponState
  applyCouponByCode: (code?: string) => Promise<void>
  handleCouponCodeChange: (code: string) => void
  handleRemoveCoupon: () => void
  watchedCouponCode: string | undefined
  subtotal: number
}

export default function CouponSection({
  control,
  availableCouponsQuery,
  coupon,
  applyCouponByCode,
  handleCouponCodeChange,
  handleRemoveCoupon,
  watchedCouponCode,
  subtotal,
}: Props) {
  return (
    <Card>
      <CheckoutSectionTitle step={2} title='Mã giảm giá' />
      <div className='flex gap-2 mb-4'>
        <Controller
          name='couponCode'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder='Nhập mã giảm giá'
              onChange={(e) => handleCouponCodeChange(e.target.value)}
            />
          )}
        />
        <Button
          type='primary'
          loading={coupon.isApplying}
          onClick={() => void applyCouponByCode()}
          className='rounded-md shrink-0'
        >
          Áp dụng
        </Button>
        {coupon.appliedCode && (
          <Button
            danger
            onClick={handleRemoveCoupon}
            className='rounded-lg! shrink-0'
          >
            Xóa
          </Button>
        )}
      </div>

      {coupon.appliedCode && (
        <div className='flex gap-2 items-center p-3 mb-4 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200'>
          <svg
            className='w-4 h-4 shrink-0'
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
          <span>
            {' '}
            Mã giảm giá
            <span className='font-semibold'> {coupon.appliedCode} </span>
            đã được áp dụng — tiết kiệm {formatCurrency(coupon.discountAmount)}
          </span>
        </div>
      )}

      {(availableCouponsQuery.data ?? []).length > 0 && (
        <div className='overflow-y-auto pr-1 max-h-64'>
          <p className='mb-3 text-xs font-medium tracking-wide uppercase text-slate-400'>
            Mã giảm giá có sẵn
          </p>
          <div className='grid gap-2 sm:grid-cols-2'>
            {(availableCouponsQuery.data ?? []).map((c: AvailableCoupon) => {
              const isExhausted = c.maxUsage > 0 && c.usedCount >= c.maxUsage
              const isEligible = subtotal >= c.minOrderSubtotal && !isExhausted
              const isSelected =
                (watchedCouponCode || '').toUpperCase() === c.code.toUpperCase()
              return (
                <AvailableCouponCard
                  key={c.id}
                  coupon={c}
                  isSelected={isSelected}
                  isEligible={isEligible}
                  isApplyingCoupon={coupon.isApplying}
                  onApply={(code) => {
                    handleCouponCodeChange(code)
                    void applyCouponByCode(code)
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
