import type { ColumnType } from 'antd/es/table'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addToCart, openDrawer, selectCartItems } from '@/state/cart-slice'
import { getCategories, getProducts } from '@/api/products-api'
import { formatCurrency } from '@/utils/format'
import type {
  Category,
  DescriptionLayout,
  Product,
  ProductSelection
} from '@/types/product.type'
import { formatDescriptionSpecDisplayValue } from '@/constants/product.constant'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import CartQuantityControl from '@/components/CartQuantityControl'
import ProductCard from '@/components/ProductCard'
import ProductDetailsTable from '@/components/product/ProductDetailsTable'
import ProductSaleCountdown from '@/components/product/ProductSaleCountdown'
import ProductPurchaseActions from '@/components/product/ProductPurchaseActions'
import ProductVariantSelectors from '@/components/product/ProductVariantSelectors'
import ProductTabs from '@/components/product/ProductTabs'
import SizeGuideModal from '@/components/product/SizeGuideModal'
import {
  getCategoryAncestorChain,
  toProductsCategorySearchUrl
} from '@/utils/category-tree'
import { getGalleryUrlsForColor } from '@/utils/product-color-images'
import { getStatisticTimerFormatForSaleEnd } from '@/utils/countdown-statistic-format'
import { getEffectivePriceAt } from '@/utils/product-pricing'
import { compareSizes, normalizeSize } from '@/utils/size-utils'
import { toCapitalize } from '@/utils/table.lib'
import { MeasurementProfile, CategoryType } from '@/enums'
import {
  getMeasurementPresetRows,
  normalizeMeasurementGender,
  type MeasurementPresetRow
} from '@/constants/measurement-presets.constant'
import ProductGallery from '@/components/product/ProductGallery'
import { Button, Result } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'

const BOTTOMS_CATEGORY_PATTERN = /quần|váy|đầm|dress/i

function parseDescriptionLayout(raw?: string | null): DescriptionLayout | null {
  if (!raw?.trim()) return null
  try {
    return JSON.parse(raw) as DescriptionLayout
  } catch {
    return null
  }
}

function resolveSizeGuideProfile(
  product: Product | undefined,
  category: Category | undefined
): MeasurementProfile {
  const categoryText = `${product?.categoryName ?? ''} ${category?.name ?? ''}`

  if (category?.productType === CategoryType.SHOES) {
    return MeasurementProfile.SHOES
  }

  if (
    category?.productType === CategoryType.CLOTHING &&
    BOTTOMS_CATEGORY_PATTERN.test(categoryText)
  ) {
    return MeasurementProfile.BOTTOMS
  }

  return MeasurementProfile.TOPS
}

function buildSizeGuideColumns(
  profile: MeasurementProfile
): ColumnType<MeasurementPresetRow>[] {
  if (profile === MeasurementProfile.SHOES) {
    return [
      { title: 'Size', dataIndex: 'size', key: 'size', align: 'center' },
      {
        title: 'Độ dài (cm)',
        dataIndex: 'footLength',
        key: 'footLength',
        align: 'center'
      }
    ]
  }

  if (profile === MeasurementProfile.BOTTOMS) {
    return [
      { title: 'Size', dataIndex: 'size', key: 'size', align: 'center' },
      {
        title: 'Chiều cao (cm)',
        dataIndex: 'height',
        key: 'height',
        align: 'center'
      },
      {
        title: 'Cân nặng (kg)',
        dataIndex: 'weight',
        key: 'weight',
        align: 'center'
      },
      {
        title: 'Vòng eo (cm)',
        dataIndex: 'waist',
        key: 'waist',
        align: 'center'
      }
    ]
  }

  return [
    { title: 'Size', dataIndex: 'size', key: 'size', align: 'center' },
    {
      title: 'Chiều cao (cm)',
      dataIndex: 'height',
      key: 'height',
      align: 'center'
    },
    {
      title: 'Cân nặng (kg)',
      dataIndex: 'weight',
      key: 'weight',
      align: 'center'
    },
    {
      title: 'Vòng ngực (cm)',
      dataIndex: 'chest',
      key: 'chest',
      align: 'center'
    }
  ]
}

function buildProductDetails(
  product: Product,
  descriptionLayout: DescriptionLayout | null
): Array<{ label: string; value: string }> {
  if (!descriptionLayout?.specs?.length) {
    return [
      {
        label: 'Mã sản phẩm',
        value: product.productCode.toUpperCase()
      }
    ]
  }

  return [
    {
      label: 'Mã sản phẩm',
      value: product.productCode.toUpperCase()
    },
    ...descriptionLayout.specs.map((spec) => ({
      label: String(spec.label ?? ''),
      value: formatDescriptionSpecDisplayValue(String(spec.value ?? ''))
    }))
  ]
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [selection, setSelection] = useState<ProductSelection>({
    color: undefined,
    size: undefined,
    quantity: 1,
    image: ''
  })
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [timer, setTimer] = useState(() => ({ now: Date.now() }))

  const refreshSaleTimer = useCallback(() => {
    setTimer({ now: Date.now() })
  }, [])

  const { data: products = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: getProducts
  })

  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories
  })

  const cartItems = useSelector(selectCartItems)
  const product = products.find((item) => item.slug === slug)
  const listCategory = categories.find(
    (item) => item.id === product?.categoryId
  )

  const descriptionLayout = useMemo(
    () => parseDescriptionLayout(product?.descriptionData),
    [product?.descriptionData]
  )

  const saleEndDate = product?.salePriceEndDate ?? null
  const saleEndTimestamp = useMemo(
    () => (saleEndDate ? new Date(saleEndDate).getTime() : null),
    [saleEndDate]
  )
  const hasDiscount = product
    ? product.salePrice != null && product.salePrice < product.price
    : false
  const effectiveDisplayPrice = useMemo(
    () => (product ? getEffectivePriceAt(product, timer.now) : 0),
    [product, timer.now]
  )
  const showSaleCountdown = Boolean(
    product &&
    saleEndDate &&
    hasDiscount &&
    effectiveDisplayPrice < product.price
  )

  useEffect(() => {
    if (!showSaleCountdown || !saleEndDate) return
    const refreshNow = () => setTimer({ now: Date.now() })
    const immediate = window.setTimeout(refreshNow, 0)
    const intervalId = window.setInterval(refreshNow, 1000)
    return () => {
      window.clearTimeout(immediate)
      window.clearInterval(intervalId)
    }
  }, [saleEndDate, showSaleCountdown])

  const saleStatisticCountdownFormat = useMemo(
    () =>
      saleEndDate
        ? getStatisticTimerFormatForSaleEnd(saleEndDate, timer.now)
        : 'HH:mm:ss',
    [saleEndDate, timer.now]
  )

  const similarProducts = useMemo(() => {
    const categoryId = product?.categoryId
    const productId = product?.id
    if (!categoryId || !productId) return []
    return products
      .filter((item) => item.categoryId === categoryId && item.id !== productId)
      .slice(0, 8)
  }, [products, product?.categoryId, product?.id])

  const categoryBreadcrumbs = useMemo(() => {
    const apiTrail = product?.categoryBreadcrumbs
    if (apiTrail?.length) {
      return apiTrail.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug ?? ''
      }))
    }
    return getCategoryAncestorChain(categories, product?.categoryId)
  }, [categories, product?.categoryBreadcrumbs, product?.categoryId])

  const variants = useMemo(() => product?.variants ?? [], [product?.variants])
  const colorOptions = useMemo(
    () => [...new Set(variants.map((variant) => variant.color))],
    [variants]
  )
  const firstAvailableColor = useMemo(
    () =>
      colorOptions.find((color) =>
        variants.some(
          (variant) => variant.color === color && variant.quantity > 0
        )
      ),
    [colorOptions, variants]
  )

  const resolvedColor =
    selection.color ?? firstAvailableColor ?? colorOptions[0]

  const galleryImages = useMemo(() => {
    if (!product) return []
    return getGalleryUrlsForColor(product, resolvedColor)
  }, [product, resolvedColor])

  const sizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter((variant) => variant.color === resolvedColor)
            .map((variant) => normalizeSize(variant.size))
        )
      ).toSorted(compareSizes),
    [variants, resolvedColor]
  )

  const firstAvailableSize = useMemo(
    () =>
      sizeOptions.find((size) =>
        variants.some(
          (variant) =>
            variant.color === resolvedColor &&
            normalizeSize(variant.size) === size &&
            variant.quantity > 0
        )
      ),
    [resolvedColor, sizeOptions, variants]
  )

  const hasSizes = sizeOptions.some((s) => s.trim().length > 0)
  const resolvedSize = hasSizes
    ? (selection.size ?? firstAvailableSize ?? sizeOptions[0])
    : undefined

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (variant) =>
          variant.color === resolvedColor &&
          (!hasSizes || normalizeSize(variant.size) === resolvedSize) &&
          variant.quantity > 0
      ),
    [resolvedColor, resolvedSize, hasSizes, variants]
  )

  const cartQuantityForSelectedVariant = useMemo(() => {
    if (!product || !selectedVariant) return 0
    return cartItems
      .filter(
        (item) =>
          item.id === product.id && item.productVariantId === selectedVariant.id
      )
      .reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems, product, selectedVariant])

  const remainingStock = Math.max(
    0,
    (selectedVariant?.quantity ?? 0) - cartQuantityForSelectedVariant
  )
  const isOutOfStock = !selectedVariant || remainingStock <= 0

  const handleAddToCart = useCallback(() => {
    if (!product || isOutOfStock) return
    dispatch(
      addToCart({
        product,
        productVariantId: selectedVariant?.id,
        selectedSize: selectedVariant?.size,
        selectedColor: selectedVariant?.color,
        quantity: selection.quantity
      })
    )
    dispatch(openDrawer())
  }, [dispatch, isOutOfStock, product, selection.quantity, selectedVariant])

  const handleBuyNow = useCallback(() => {
    if (!product || isOutOfStock) return
    dispatch(
      addToCart({
        product,
        productVariantId: selectedVariant?.id,
        selectedSize: selectedVariant?.size,
        selectedColor: selectedVariant?.color,
        quantity: selection.quantity
      })
    )
    navigate('/checkout')
  }, [
    dispatch,
    isOutOfStock,
    navigate,
    product,
    selection.quantity,
    selectedVariant
  ])

  const productDetails = useMemo(() => {
    if (!product) return []
    return buildProductDetails(product, descriptionLayout)
  }, [descriptionLayout, product])

  const sizeGuideProfile = resolveSizeGuideProfile(product, listCategory)
  const sizeGuideProfileForDisplay =
    descriptionLayout?.sizeGuide?.profile ?? sizeGuideProfile
  const sizeGuideGenderForDisplay = normalizeMeasurementGender(
    descriptionLayout?.sizeGuide?.gender ?? listCategory?.gender
  )
  const sizeGuideColumns = buildSizeGuideColumns(sizeGuideProfileForDisplay)
  const sizeGuideRows = useMemo(() => {
    const rows = descriptionLayout?.sizeGuide?.rows
    return Array.isArray(rows) ? rows : []
  }, [descriptionLayout?.sizeGuide?.rows])
  const sizeGuideTableData =
    sizeGuideRows.length > 0
      ? sizeGuideRows
      : getMeasurementPresetRows(
          sizeGuideProfileForDisplay,
          sizeGuideGenderForDisplay
        )

  const productCategoryListHref = listCategory
    ? toProductsCategorySearchUrl(listCategory)
    : `/products?category=${encodeURIComponent(
        product?.categorySlug?.trim()
          ? product.categorySlug
          : (product?.categoryId ?? '')
      )}`

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-80">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-400">
          Loading…
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50/50 rounded-2xl border border-stone-100 my-4 px-4">
        <Result
          status="404"
          title={
            <span className="text-xl font-medium text-stone-800">
              Sản phẩm không tồn tại
            </span>
          }
          subTitle={
            <p className="max-w-md mx-auto mt-1 text-sm leading-relaxed text-stone-500">
              Có vẻ như liên kết đã bị hỏng, sản phẩm đã ngừng kinh doanh hoặc
              danh mục vừa được cập nhật lại.
            </p>
          }
          extra={
            <Link to="/products">
              <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                Tiếp tục mua sắm
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <section>
      <nav className="flex flex-wrap items-center gap-2 mb-8 text-xs font-medium text-stone-400">
        <Link
          to="/"
          className="text-stone-400! hover:text-stone-600 hover:underline!"
        >
          Home
        </Link>
        {categoryBreadcrumbs.length > 0 ? (
          categoryBreadcrumbs.map((item) => (
            <Fragment key={item.id}>
              <span className="text-stone-300">/</span>
              <Link
                to={toProductsCategorySearchUrl(item)}
                className="text-stone-400! hover:text-stone-600 hover:underline!"
              >
                {item.name}
              </Link>
            </Fragment>
          ))
        ) : (
          <>
            <span className="text-stone-300">/</span>
            <Link
              to={productCategoryListHref}
              className="text-stone-400! hover:text-stone-600 hover:underline!"
            >
              {product.category ?? product.categoryName}
            </Link>
          </>
        )}
        <span className="text-stone-300">/</span>
        <span className="text-stone-600">{toCapitalize(product.name)}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <ProductGallery
            galleryImages={galleryImages}
            selection={selection}
            setSelection={setSelection}
            productName={product.name}
          />
          <ProductDetailsTable productDetails={productDetails} />
        </div>

        <aside className="w-full space-y-8 lg:sticky lg:top-8 lg:h-fit">
          <div className="pb-4 space-y-3 border-b border-stone-200">
            <h1 className="mt-3! text-3xl font-normal leading-snug tracking-tight text-stone-900">
              {toCapitalize(product.name)}
            </h1>
            {selectedVariant?.sku ? (
              <p className="text-sm text-stone-500">
                SKU: {selectedVariant.sku}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            {showSaleCountdown && saleEndDate ? (
              <div className="flex flex-wrap items-center justify-between w-full gap-4">
                <span className="text-3xl font-semibold tabular-nums text-rose-700">
                  {formatCurrency(product.salePrice ?? 0)}
                </span>
                <ProductSaleCountdown
                  saleEndDate={saleEndTimestamp}
                  saleStatisticCountdownFormat={saleStatisticCountdownFormat}
                  refreshSaleTimer={refreshSaleTimer}
                />
                <span className="text-lg font-medium line-through tabular-nums text-stone-400">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-stone-900">
                  {effectiveDisplayPrice !== product.price
                    ? formatCurrency(effectiveDisplayPrice)
                    : formatCurrency(product.price)}
                </span>
                {effectiveDisplayPrice !== product.price ? (
                  <span className="text-sm line-through text-stone-400">
                    {formatCurrency(product.price)}
                  </span>
                ) : null}
              </div>
            )}
            <div className="flex items-baseline gap-3">
              <img
                src="https://n7media.coolmate.me/uploads/2026/04/15/icon4.png"
                alt="Freeship"
                className="size-4"
              />
              <small className="text-xs text-stone-400">
                Freeship đơn trên 200K
              </small>
            </div>
          </div>

          <ProductVariantSelectors
            colorOptions={colorOptions}
            resolvedColor={resolvedColor}
            variants={variants}
            sizeOptions={sizeOptions}
            resolvedSize={resolvedSize}
            setSelection={setSelection}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />

          <div className="space-y-3">
            <CartQuantityControl
              value={selection.quantity}
              min={1}
              max={Math.max(1, remainingStock)}
              onChange={(next) =>
                setSelection((prev) => ({ ...prev, quantity: next }))
              }
            />
            <p className="text-[11px] text-stone-400">
              {remainingStock} sản phẩm có sẵn
            </p>
          </div>

          <ProductPurchaseActions
            isOutOfStock={isOutOfStock}
            selectedVariant={selectedVariant}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          <div className="grid grid-cols-2 mt-4 rounded-lg bg-stone-200">
            {[
              {
                title: 'https://www.coolmate.me/icons/product/free-ship.svg',
                sub: 'Free ship cho đơn từ 200k'
              },
              {
                title: 'https://www.coolmate.me/icons/product/return-60.svg',
                sub: '60 ngày đổi trả vì bất kỳ lý do gì'
              },
              {
                title: 'https://www.coolmate.me/icons/product/phone.svg',
                sub: 'Hotline 1900272737\nhỗ trợ từ 8h30 - 22h'
              },
              {
                title: 'https://www.coolmate.me/icons/product/location.svg',
                sub: 'Đến tận nơi nhận hàng trả,\nhoàn tiền 2-3 ngày (trừ T7, CN)'
              }
            ].map(({ title, sub }) => (
              <div
                key={title}
                className="flex items-center gap-2 p-4 text-start"
              >
                <img src={title} alt={title} className="size-9" />
                <p className="m-0! whitespace-pre-line text-xs text-stone-700">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <ProductTabs
        description={product.description}
        productId={product.id}
        productName={product.name}
      />

      {similarProducts.length > 0 ? (
        <div className="mt-12">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
              Sản phẩm tương tự
            </h2>
            <Link
              to={productCategoryListHref}
              className="shrink-0 text-sm font-semibold text-[#8B2332] hover:underline"
            >
              Xem thêm trong danh mục
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} mode="catalog" product={item} />
            ))}
          </div>
        </div>
      ) : null}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onCancel={() => setIsSizeGuideOpen(false)}
        columns={sizeGuideColumns}
        dataSource={sizeGuideTableData}
      />
    </section>
  )
}
