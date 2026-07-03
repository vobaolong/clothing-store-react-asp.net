import type { Dispatch, SetStateAction } from 'react'
import { toCapitalize } from '@/utils/table.lib'
import { normalizeSize } from '@/utils/size-utils'
import type { ProductSelection } from '@/types/product.type'
import type { Product } from '@/types/product.type'

type ProductVariant = Product['variants'][number]

interface ProductVariantSelectorsProps {
  colorOptions: string[]
  resolvedColor: string
  variants: ProductVariant[]
  sizeOptions: string[]
  resolvedSize: string | undefined
  setSelection: Dispatch<SetStateAction<ProductSelection>>
  onOpenSizeGuide: () => void
}

export default function ProductVariantSelectors({
  colorOptions,
  resolvedColor,
  variants,
  sizeOptions,
  resolvedSize,
  setSelection,
  onOpenSizeGuide
}: ProductVariantSelectorsProps) {
  return (
    <>
      <div className="space-y-3">
        <p className="text-sm font-semibold">
          Màu sắc:{' '}
          <span className="text-base font-medium tracking-normal normal-case text-stone-700 dark:text-stone-300">
            {toCapitalize(resolvedColor ?? '-')}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => {
            const variant = variants.find((item) => item.color === color)
            const colorQty = variants
              .filter((item) => item.color === color)
              .reduce((sum, item) => sum + item.quantity, 0)
            const isDisabled = colorQty <= 0
            const isSelected = resolvedColor === color

            return (
              <button
                key={color}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  setSelection((prev) => ({
                    ...prev,
                    color,
                    size: undefined,
                    quantity: 1,
                    image: ''
                  }))
                }}
                style={{ backgroundColor: variant?.hex ?? '#e5e7eb' }}
                className={`relative h-7 w-12 rounded-full border-2 transition-all duration-150 ${
                  isSelected
                    ? 'scale-110 border-blue-600 shadow-sm'
                    : 'border-stone-200'
                } ${
                  isDisabled
                    ? 'cursor-not-allowed opacity-30'
                    : 'cursor-pointer hover:border-stone-400'
                }`}
              >
                {isDisabled ? (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="block h-px w-[80%] -rotate-12 bg-white mix-blend-difference" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {sizeOptions.length > 0 &&
        sizeOptions.some((s) => s.trim().length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="m-0! text-sm font-semibold">
                Kích thước:{' '}
                <span className="text-base font-medium tracking-normal normal-case text-stone-700 dark:text-stone-300">
                  {toCapitalize(resolvedSize ?? '-')}
                </span>
              </p>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="cursor-pointer text-xs! text-blue-700! underline underline-offset-2 transition-colors hover:text-stone-600"
              >
                Hướng dẫn chọn size
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => {
                const sizeVariant = variants.find(
                  (item) =>
                    item.color === resolvedColor &&
                    normalizeSize(item.size) === size
                )
                const isDisabled = (sizeVariant?.quantity ?? 0) <= 0

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      setSelection((prev) => ({ ...prev, size, quantity: 1 }))
                    }}
                    className={`relative min-w-12 rounded-xl px-3 py-2 text-xs! font-semibold tracking-wider transition-all duration-150 ${
                      resolvedSize === size
                        ? 'bg-black text-white! dark:bg-neutral-700 dark:text-stone-300'
                        : 'bg-stone-200 text-stone-600 dark:text-black! dark:bg-white'
                    } ${
                      isDisabled
                        ? 'cursor-not-allowed opacity-45 line-through'
                        : 'cursor-pointer'
                    }`}
                  >
                    {size}
                    {isDisabled ? (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="block h-px w-[75%] -rotate-12 bg-stone-500" />
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        )}
    </>
  )
}
