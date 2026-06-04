import { Button } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'
import { formatCurrency } from '@/utils/format'
import { toCapitalize } from '@/utils/table.lib'
import type { Product } from '@/types/product.type'

type ProductVariant = Product['variants'][number]

type ProductFixedBuyBarProps = {
  visible: boolean
  imageUrl?: string
  productName: string
  price: number
  salePrice?: number | null
  isOutOfStock: boolean
  selectedVariant?: ProductVariant
  onAddToCart: () => void
  onBuyNow: () => void
}

export default function ProductFixedBuyBar({
  visible,
  imageUrl,
  productName,
  price,
  salePrice,
  isOutOfStock,
  selectedVariant,
  onAddToCart,
  onBuyNow
}: ProductFixedBuyBarProps) {
  const hasSale = salePrice != null && salePrice < price

  return (
    <div
      className={[
        'fixed bottom-4 left-0 right-0 z-50 px-4',
        'transform-gpu will-change-transform will-change-opacity',
        'transition-[opacity,transform] duration-500 ease-out',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8 pointer-events-none'
      ].join(' ')}
    >
      <div className="flex items-center max-w-3xl gap-3 p-3 mx-auto bg-white border shadow rounded-xl border-white/40 backdrop-blur-md">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="object-cover rounded-lg size-16 shrink-0"
          />
        ) : null}

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate text-stone-900">
            {toCapitalize(productName)}{' '}
            <span className="text-xs text-stone-500">
              {selectedVariant
                ? `- ${toCapitalize(selectedVariant.color)} / ${toCapitalize(selectedVariant.size)}`
                : ''}
            </span>
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {hasSale ? (
              <>
                <span className="text-sm font-semibold text-rose-700">
                  {formatCurrency(salePrice)}
                </span>
                <span className="text-xs line-through text-stone-400">
                  {formatCurrency(price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-stone-900">
                {formatCurrency(price)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="primary"
            size="middle"
            disabled={isOutOfStock || !selectedVariant}
            onClick={onBuyNow}
            className="px-4 text-sm font-medium"
          >
            Mua nhanh
          </Button>
          <Button
            size="middle"
            type="default"
            disabled={isOutOfStock}
            onClick={onAddToCart}
            icon={<ShoppingOutlined />}
            className="hidden px-4 text-sm font-medium text-white sm:inline-flex"
          />
        </div>
      </div>
    </div>
  )
}
