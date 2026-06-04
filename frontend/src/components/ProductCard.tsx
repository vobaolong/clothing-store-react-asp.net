import { Badge, Button, Card, Rate } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getGalleryUrlsForColor } from '@/utils/product-color-images'
import ProductColorSwatches from '@/components/products/ProductColorSwatches'
import { toCapitalize } from '@/utils/table.lib'
import { getEffectivePriceAt } from '@/utils/product-pricing'
import WishlistToggleButton from '@/components/wishlist/WishlistToggleButton'

const NEW_BADGE_MAX_AGE_MS = 24 * 60 * 60 * 1000 * 30 // 30 days

function isNewProduct(createdAt: string | undefined): boolean {
  if (!createdAt?.trim()) return false
  const t = new Date(createdAt).getTime()
  if (!Number.isFinite(t)) return false
  return Date.now() - t <= NEW_BADGE_MAX_AGE_MS
}

type ProductCardProps = {
  product: Product
  mode?: 'catalog' | 'featured'
}

export default function ProductCard({
  product,
  mode = 'featured'
}: ProductCardProps) {
  const navigate = useNavigate()
  const isCatalog = mode === 'catalog'
  const firstVariant = product.variants[0]
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const defaultColor =
    product.variants.find((v) => v.color?.trim())?.color.trim() ?? ''
  const activeColor = previewColor ?? defaultColor
  const galleryUrls = useMemo(
    () => getGalleryUrlsForColor(product, activeColor),
    [product, activeColor]
  )
  const imageSrc = galleryUrls[0] ?? ''
  const imageSrc2 = galleryUrls[1] ?? galleryUrls[0] ?? ''
  const listPrice = product.price
  const [nowMs] = useState(() => Date.now())
  const effectiveDisplayPrice = getEffectivePriceAt(product, nowMs)
  const discountPercent =
    product.salePrice !== null &&
    listPrice > effectiveDisplayPrice &&
    listPrice > 0
      ? Math.round(((listPrice - effectiveDisplayPrice) / listPrice) * 100)
      : 0
  const averageRating =
    typeof product.averageRating === 'number' &&
    Number.isFinite(product.averageRating)
      ? product.averageRating
      : 0
  const singleStarValue =
    averageRating <= 0 ? 0 : Number.isInteger(averageRating) ? 1 : 0.5
  const showNewBadge = isNewProduct(product.createdAt)
  const cardContent = (
    <Card
      hoverable
      className={`group h-full cursor-pointer overflow-hidden rounded-lg border border-slate-200 shadow-none! hover:shadow-none! [&_.ant-card-body]:flex ${
        isCatalog
          ? '[&_.ant-card-body]:flex-col [&_.ant-card-body]:p-3!'
          : '[&_.ant-card-body]:max-h-65 [&_.ant-card-body]:flex-col [&_.ant-card-body]:p-4!'
      }`}
      onClick={() => navigate(`/products/${product.slug}`)}
      cover={
        <div className="overflow-hidden relative w-full aspect-square bg-slate-100">
          {showNewBadge ? (
            <span className="absolute left-2 top-2 z-10 rounded bg-red-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              NEW
            </span>
          ) : null}
          <img
            loading="lazy"
            src={imageSrc}
            alt={product.name}
            className="object-cover absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          />
          <img
            loading="lazy"
            src={imageSrc2}
            alt={product.name}
            className="object-cover absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
      }
    >
      <div className={isCatalog ? 'mb-1 min-h-5' : 'mb-2 min-h-5'}>
        <ProductColorSwatches
          variants={product.variants}
          maxColors={3}
          size="compact"
          onPreviewColor={setPreviewColor}
        />
      </div>
      <p
        className={
          'line-clamp-2 wrap-break-word w-full text-small font-normal text-[#3c3c43] hover:text-[#7f0019] h-10!'
        }
      >
        {toCapitalize(product.name)}
      </p>
      <div className={isCatalog ? 'mt-auto space-y-2' : 'mt-auto space-y-3'}>
        <div
          className={
            isCatalog
              ? 'flex h-5 items-start justify-between gap-2'
              : 'flex h-6 items-start justify-between gap-2'
          }
        >
          <span
            className={
              isCatalog
                ? 'text-base! font-semibold! leading-none text-red-800'
                : 'text-lg! font-semibold! leading-none text-red-800'
            }
          >
            {formatCurrency(effectiveDisplayPrice)}
          </span>
          <span
            className={`line-through leading-none text-slate-400 ${
              isCatalog ? 'text-xs' : 'text-base'
            } ${listPrice > effectiveDisplayPrice ? 'opacity-100' : 'opacity-0'}`}
          >
            {formatCurrency(listPrice)}
          </span>
        </div>

        <Button
          block
          size={isCatalog ? 'middle' : 'large'}
          type="primary"
          className="rounded-md!"
          disabled={!firstVariant}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/products/${product.slug}`)
          }}
        >
          Mua hàng
        </Button>
        <div className="flex justify-between items-center mt-2">
          {averageRating > 0 ? (
            <span className="inline-flex gap-1 items-center text-sm text-slate-600">
              <Rate
                disabled
                allowHalf
                count={1}
                value={singleStarValue}
                className="text-sm! leading-none text-amber-500"
              />
              {averageRating.toFixed(1)}
            </span>
          ) : (
            <span />
          )}
          <WishlistToggleButton product={product} compact />
        </div>
      </div>
    </Card>
  )

  return discountPercent > 0 ? (
    <Badge.Ribbon text={`-${discountPercent}%`} color="red" placement="end">
      {cardContent}
    </Badge.Ribbon>
  ) : (
    cardContent
  )
}
