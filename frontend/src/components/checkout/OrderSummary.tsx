import { Card, Tag } from 'antd'
import { formatCurrency } from '@/utils/format'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/utils/checkout-utils'
import { getEffectivePriceAt } from '@/utils/product-pricing'
import type { CartItem } from '@/types/cart.type'
import { useTranslation } from 'react-i18next'

type Props = {
  items: CartItem[]
  nowMs: number
  subtotal: number
  finalTotal: number
  rawTotal: number
  discountAmount: number
  appliedCouponCode?: string
}

export default function OrderSummary({
  items,
  nowMs,
  subtotal,
  finalTotal,
  rawTotal,
  discountAmount,
  appliedCouponCode
}: Props) {
  const isFreeShipping = rawTotal >= FREE_SHIPPING_THRESHOLD
  const { t } = useTranslation()

  return (
    <Card
      title={
        <span className="font-semibold text-slate-800 dark:text-white">
          {t('common.total')}
        </span>
      }
    >
      <div className="text-sm space-y-3">
        <div className="pr-1 overflow-y-auto space-y-2">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.productVariantId}`}
              className="flex justify-between gap-2"
            >
              <span className="text-slate-600 dark:text-gray-400">
                <span className="font-medium line-clamp-2">{item.name}</span>
                {item.selectedColor}
                {item.selectedSize ? ` / ${item.selectedSize}` : ''}
              </span>
              <span className="text-slate-400 dark:text-gray-400">
                ×{item.quantity}
              </span>
              <span className="text-slate-800 dark:text-white shrink-0">
                {formatCurrency(
                  getEffectivePriceAt(item, nowMs) * item.quantity
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t space-y-2 border-slate-100">
          <div className="flex justify-between text-slate-600 dark:text-gray-400">
            <span>{t('order.total')}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-gray-400">
              <span>{t('order.discount')}</span>
              <span className="text-right">
                <Tag className="text-xs! bg-emerald-100! text-emerald-700! border-emerald-200! leading-none! p-1!">
                  {appliedCouponCode}
                </Tag>
                <span> - {formatCurrency(discountAmount)}</span>
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 dark:text-gray-400">
            <span>{t('order.shippingFee')}</span>
            <span
              className={isFreeShipping ? 'text-green-600 font-medium' : ''}
            >
              {isFreeShipping ? t('order.free') : formatCurrency(SHIPPING_FEE)}
            </span>
          </div>
        </div>

        <div className="flex justify-between pt-3 text-base font-semibold border-t border-slate-200 text-slate-900 dark:text-white">
          <span>{t('order.total')}</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>

        {!isFreeShipping && (
          <p className="pt-1 text-xs text-center text-slate-400">
            {t('order.addMoreForFreeShipping', {
              amount: formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)
            })}
          </p>
        )}
      </div>
    </Card>
  )
}
