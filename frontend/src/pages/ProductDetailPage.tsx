import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addToCart, openDrawer, selectCartItems } from '@/state/cart-slice'
import { selectIsAuthenticated } from '@/state/auth/auth-selectors'
import { getCategories, getProducts } from '@/api/products-api'
import { formatCurrency } from '@/utils/format'
import { lp } from '@/utils/language-path'
import type { ProductSelection } from '@/types/product.type'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import CartQuantityControl from '@/components/CartQuantityControl'
import ProductDetailsTable from '@/components/product/ProductDetailsTable'
import ProductSaleCountdown from '@/components/product/ProductSaleCountdown'
import ProductPurchaseActions from '@/components/product/ProductPurchaseActions'
import ProductVariantSelectors from '@/components/product/ProductVariantSelectors'
import ProductTabs from '@/components/product/ProductTabs'
import SizeGuideModal from '@/components/product/SizeGuideModal'
import ProductDetailBreadcrumbs from '@/components/product/ProductDetailBreadcrumbs'
import ProductFeatureIcons from '@/components/product/ProductFeatureIcons'
import SimilarProducts from '@/components/product/SimilarProducts'
import {
  getCategoryAncestorChain,
  toProductsCategorySearchUrl
} from '@/utils/category-tree'
import { getGalleryUrlsForColor } from '@/utils/product-color-images'
import { getStatisticTimerFormatForSaleEnd } from '@/utils/countdown-statistic-format'
import { getEffectivePriceAt } from '@/utils/product-pricing'
import { compareSizes, normalizeSize } from '@/utils/size-utils'
import { toCapitalize } from '@/utils/table.lib'
import {
  parseDescriptionLayout,
  resolveSizeGuideProfile,
  buildSizeGuideColumns,
  buildProductDetails,
  buildSizeGuideTableData
} from '@/utils/product-detail-utils'
import ProductGallery from '@/components/product/ProductGallery'
import ProductFixedBuyBar from '@/components/ProductFixedBuyBar'
import { Button, Result, Skeleton } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'
import { FreeShipIcon } from '@/components/icons'

export default function ProductDetailPage() {
  const { t } = useTranslation()
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
  const [showFixedBuyBar, setShowFixedBuyBar] = useState(false)
  const purchaseActionsRef = useRef<HTMLDivElement>(null)
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
  const isAuthenticated = useSelector(selectIsAuthenticated)
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

  useEffect(() => {
    const target = purchaseActionsRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowFixedBuyBar(!entry.isIntersecting),
      { threshold: 0.2 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [product?.id])

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
    if (!isAuthenticated) {
      navigate(lp('/login'))
      return
    }
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
  }, [dispatch, isAuthenticated, isOutOfStock, navigate, product, selection.quantity, selectedVariant])

  const handleBuyNow = useCallback(() => {
    if (!product || isOutOfStock) return
    if (!isAuthenticated) {
      navigate(lp('/login'))
      return
    }
    dispatch(
      addToCart({
        product,
        productVariantId: selectedVariant?.id,
        selectedSize: selectedVariant?.size,
        selectedColor: selectedVariant?.color,
        quantity: selection.quantity
      })
    )
    navigate(lp('/checkout'))
  }, [
    dispatch,
    isAuthenticated,
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
  const sizeGuideColumns = buildSizeGuideColumns(sizeGuideProfileForDisplay)
  const sizeGuideTableData = buildSizeGuideTableData(
    descriptionLayout,
    sizeGuideProfileForDisplay,
    descriptionLayout?.sizeGuide?.gender ?? listCategory?.gender
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
      <section className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton active className="mb-6 w-96!" />
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton active className="aspect-square!" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} active className="size-20!" />
              ))}
            </div>
          </div>
          <aside className="space-y-8">
            <Skeleton active paragraph={{ rows: 1 }} className="w-3/4!" />
            <Skeleton active paragraph={{ rows: 1 }} className="w-1/3!" />
            <Skeleton active paragraph={{ rows: 3 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active className="h-10!" />
            <Skeleton active className="h-12!" />
          </aside>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-stone-50/50 rounded-2xl border border-stone-100 my-4 px-4">
        <Result
          status="404"
          title={
            <span className="text-xl font-medium text-stone-800">
              {t('product.notFound')}
            </span>
          }
          subTitle={
            <p className="max-w-md mx-auto mt-1 text-sm leading-relaxed text-stone-500">
              {t('product.notFoundDesc')}
            </p>
          }
          extra={
            <Link to={lp('/products')}>
              <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                {t('product.continueShopping')}
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <section>
      <ProductDetailBreadcrumbs
        categoryBreadcrumbs={categoryBreadcrumbs}
        productCategoryListHref={productCategoryListHref}
        categoryName={product.category ?? product.categoryName}
        productName={toCapitalize(product.name)}
      />

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
            <h1 className="mt-3! text-3xl font-normal leading-snug tracking-tight">
              {toCapitalize(product.name)}
            </h1>
            {selectedVariant?.sku ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {t('product.sku')}: {selectedVariant.sku}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            {showSaleCountdown && saleEndDate ? (
              <div className="flex flex-wrap items-center justify-between w-full gap-4">
                <span className="text-3xl font-semibold tabular-nums text-rose-700. dark:text-rose-500">
                  {formatCurrency(product.salePrice ?? 0)}
                </span>
                <ProductSaleCountdown
                  saleEndDate={saleEndTimestamp}
                  saleStatisticCountdownFormat={saleStatisticCountdownFormat}
                  refreshSaleTimer={refreshSaleTimer}
                />
                <span className="text-lg font-medium line-through tabular-nums text-stone-400 dark:text-stone-100">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
                  {effectiveDisplayPrice !== product.price
                    ? formatCurrency(effectiveDisplayPrice)
                    : formatCurrency(product.price)}
                </span>
                {effectiveDisplayPrice !== product.price ? (
                  <span className="text-sm line-through text-stone-400 dark:text-stone-100">
                    {formatCurrency(product.price)}
                  </span>
                ) : null}
              </div>
            )}
            <div className="flex items-center gap-3">
              <FreeShipIcon className="size-4 inline-block" />
              <small className="text-xs text-stone-400">
                {t('product.freeShippingTag')}
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
              {t('product.inStockCount', { count: remainingStock })}
            </p>
          </div>

          <div ref={purchaseActionsRef}>
            <ProductPurchaseActions
              isOutOfStock={isOutOfStock}
              selectedVariant={selectedVariant}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>

          <ProductFeatureIcons />
        </aside>
      </div>

      <ProductTabs
        description={product.description}
        productId={product.id}
        productName={product.name}
      />

      <SimilarProducts
        products={similarProducts}
        listHref={productCategoryListHref}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onCancel={() => setIsSizeGuideOpen(false)}
        columns={sizeGuideColumns}
        dataSource={sizeGuideTableData}
      />
      <ProductFixedBuyBar
        visible={showFixedBuyBar}
        imageUrl={galleryImages[0]}
        productName={product.name}
        price={product.price}
        salePrice={
          effectiveDisplayPrice !== product.price ? effectiveDisplayPrice : null
        }
        isOutOfStock={isOutOfStock}
        selectedVariant={selectedVariant}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </section>
  )
}
