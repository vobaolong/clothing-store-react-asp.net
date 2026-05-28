import { Card, Tag } from 'antd'
import { formatCurrency } from '@/utils/format'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/utils/checkout-utils'
import { getEffectivePriceAt } from '@/utils/product-pricing'
import type { CartItem } from '@/types/cart.type'

type Props = {
  items: CartItem[]
  nowMs: number
  subtotal: number
  finalTotal: number
  total: number
  discountAmount: number
  appliedCouponCode?: string
}

export default function OrderSummary({
  items,
  nowMs,
  subtotal,
  finalTotal,
  total,
  discountAmount,
  appliedCouponCode,
}: Props) {
  return (
    <Card
      className='rounded-2xl border-slate-200 shadow-sm lg:sticky!'
      title={<span className='font-semibold text-slate-800'>Tổng tiền</span>}
    >
      <div className='space-y-3 text-sm'>
        <div className='overflow-y-auto pr-1 space-y-2'>
          {items.map((item) => (
            <div
              key={`${item.id}-${item.productVariantId}`}
              className='flex gap-2 justify-between'
            >
              <span className='text-slate-600'>
                <span className='font-medium line-clamp-2'>{item.name}</span>
                {item.selectedSize} / {item.selectedColor}
              </span>
              <span className=' text-slate-400'>×{item.quantity}</span>
              <span className='text-slate-800 shrink-0'>
                {formatCurrency(
                  getEffectivePriceAt(item, nowMs) * item.quantity,
                )}
              </span>
            </div>
          ))}
        </div>

        <div className='pt-3 space-y-2 border-t border-slate-100'>
          <div className='flex justify-between text-slate-600'>
            <span>Tổng tiền</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className='flex justify-between text-slate-600'>
              <span>Giảm giá</span>
              <span className='text-right'>
                <Tag className='text-xs! bg-emerald-100! text-emerald-700! border-emerald-200! leading-none! p-1!'>
                  {appliedCouponCode}
                </Tag>
                <span> - {formatCurrency(discountAmount)}</span>
              </span>
            </div>
          )}

          <div className='flex justify-between text-slate-600'>
            <span>Phí vận chuyển</span>
            <span
              className={
                total >= FREE_SHIPPING_THRESHOLD
                  ? 'text-green-600 font-medium'
                  : ''
              }
            >
              {total >= FREE_SHIPPING_THRESHOLD
                ? 'Miễn phí'
                : formatCurrency(SHIPPING_FEE)}
            </span>
          </div>
        </div>

        <div className='flex justify-between pt-3 text-base font-semibold border-t border-slate-200 text-slate-900'>
          <span>Tổng tiền</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>

        {total < FREE_SHIPPING_THRESHOLD && (
          <p className='pt-1 text-xs text-center text-slate-400'>
            Thêm {formatCurrency(FREE_SHIPPING_THRESHOLD - total)} để được miễn
            phí vận chuyển
          </p>
        )}
      </div>
    </Card>
  )
}
