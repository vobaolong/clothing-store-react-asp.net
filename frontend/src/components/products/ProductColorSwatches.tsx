import type { Product } from '@/types'

type ProductColorSwatchesProps = {
  variants: Product['variants']
  maxColors?: number
  size?: 'compact' | 'default'
  onPreviewColor?: (color: string | null) => void
}

export default function ProductColorSwatches({
  variants,
  maxColors = 3,
  size = 'compact',
  onPreviewColor
}: ProductColorSwatchesProps) {
  const colorEntries = variants
    .filter((v) => v.color?.trim())
    .reduce<
      Map<
        string,
        {
          color: string
          hex: string
          totalQuantity: number
        }
      >
    >((acc, v) => {
      const color = v.color.trim()
      const hex = v.hex?.trim() || '#000000'
      const existing = acc.get(color)
      if (existing) {
        existing.totalQuantity += v.quantity
        if ((!existing.hex || existing.hex === '#000000') && hex) {
          existing.hex = hex
        }
        return acc
      }

      acc.set(color, { color, hex, totalQuantity: v.quantity })
      return acc
    }, new Map())

  if (!colorEntries.size) return null

  const colors = Array.from(colorEntries.values())
  const visible = colors.slice(0, maxColors)
  const remaining = Math.max(0, colors.length - visible.length)

  const swatchClass =
    size === 'default' ? 'h-7 w-12 border-2' : 'h-5 w-9 border-2'

  return (
    <div
      className="flex overflow-hidden flex-nowrap gap-2 items-center h-5"
      onPointerLeave={onPreviewColor ? () => onPreviewColor(null) : undefined}
    >
      {visible.map(({ color, hex, totalQuantity }) => {
        const isDisabled = totalQuantity <= 0
        return (
          <span
            key={color}
            title={color}
            aria-label={color}
            onPointerEnter={
              onPreviewColor && !isDisabled
                ? () => onPreviewColor(color)
                : undefined
            }
            className={`relative inline-flex items-center justify-center rounded-full ${
              isDisabled ? 'opacity-30' : 'opacity-100'
            } border-stone-200 ${swatchClass}`}
            style={{ backgroundColor: hex }}
          >
            {isDisabled && (
              <span className="flex absolute inset-0 justify-center items-center pointer-events-none">
                <span className="block h-px w-[70%] -rotate-12 bg-white mix-blend-difference" />
              </span>
            )}
          </span>
        )
      })}

      {remaining > 0 && (
        <span
          className={`inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-[10px] font-semibold text-stone-600 ${
            size === 'default' ? 'h-7 px-2' : 'h-5 px-2'
          }`}
          aria-label={`+${remaining} more colors`}
        >
          +{remaining}
        </span>
      )}
    </div>
  )
}
