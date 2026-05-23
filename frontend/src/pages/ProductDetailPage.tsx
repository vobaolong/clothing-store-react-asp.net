import { Button, Image, Modal, Statistic, Table, Tabs } from 'antd'
import { useQuery } from '@tanstack/react-query'
import {
  Fragment,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addToCart } from '@/state/cart-slice'
import { getCategories, getProducts } from '@/api/products-api'
import { formatCurrency } from '@/utils/format'
import { DownOutlined, ShoppingOutlined, UpOutlined } from '@ant-design/icons'
import type { DescriptionLayout } from '@/types/product'
import { formatDescriptionSpecDisplayValue } from '@/constants/product'
import { MEASUREMENT_PRESETS } from '@/constants/measurement-presets'
import { QUERY_KEYS } from '@/constants/query-keys'
import CartQuantityControl from '@/components/CartQuantityControl'
import ProductCard from '@/components/ProductCard'
import {
  getCategoryAncestorChain,
  toProductsCategorySearchUrl
} from '@/utils/category-tree'
import { getGalleryUrlsForColor } from '@/utils/product-color-images'
import { getStatisticTimerFormatForSaleEnd } from '@/utils/countdown-statistic-format'
import { getEffectivePriceAt } from '@/utils/product-pricing'
import { compareSizes, normalizeSize } from '@/utils/size-utils'
import { toCapitalize } from '@/utils/table.lib'

const { Timer } = Statistic

const ProductReviewsSection = lazy(
  () => import('@/components/reviews/ProductReviewsSection')
)

export default function ProductDetailPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [selection, setSelection] = useState({
    color: undefined as string | undefined,
    size: undefined as string | undefined,
    quantity: 1,
    image: ''
  })

  const [ui, setUi] = useState({
    isSizeGuideOpen: false,
    thumbScrollEdges: { atTop: true, atBottom: true }
  })

  const [timer, setTimer] = useState(() => ({
    now: Date.now()
  }))

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

  const product = products.find((item) => item.slug === slug)
  const saleEndDate = product?.salePriceEndDate ?? null
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
    const id = window.setInterval(refreshNow, 1000)
    return () => {
      window.clearTimeout(immediate)
      window.clearInterval(id)
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
    const cid = product?.categoryId
    const pid = product?.id
    if (!cid || !pid) return []
    return products
      .filter((p) => p.categoryId === cid && p.id !== pid)
      .slice(0, 8)
  }, [products, product?.categoryId, product?.id])

  const descriptionLayout = useMemo<DescriptionLayout | null>(() => {
    if (!product?.descriptionData) return null
    try {
      return JSON.parse(product.descriptionData) as DescriptionLayout
    } catch {
      return null
    }
  }, [product])

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
  }, [product?.categoryBreadcrumbs, product?.categoryId, categories])

  const variants = useMemo(() => product?.variants ?? [], [product?.variants])
  const colorOptions = [...new Set(variants.map((v) => v.color))]
  const firstAvailableColor = colorOptions.find((color) =>
    variants.some((v) => v.color === color && v.quantity > 0)
  )

  const resolvedColor =
    selection.color ?? firstAvailableColor ?? colorOptions[0]

  const galleryImages = useMemo(() => {
    if (!product) return []
    return getGalleryUrlsForColor(product, resolvedColor)
  }, [product, resolvedColor])

  const currentImage = useMemo(() => {
    if (!galleryImages.length) return ''
    return galleryImages.includes(selection.image)
      ? selection.image
      : galleryImages[0]
  }, [galleryImages, selection.image])

  const thumbListRef = useRef<HTMLDivElement>(null)
  const thumbStripClamped = galleryImages.length > 6

  const refreshThumbScrollEdges = useCallback(() => {
    const el = thumbListRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setUi((prev) => ({
      ...prev,
      thumbScrollEdges: {
        atTop: scrollTop <= 1,
        atBottom: scrollTop + clientHeight >= scrollHeight - 1
      }
    }))
  }, [])

  const scrollProductThumbs = useCallback((dir: 'up' | 'down') => {
    const el = thumbListRef.current
    if (!el) return
    const first = el.querySelector('button')
    const gap = 8
    const step = first ? first.getBoundingClientRect().height + gap : 88
    el.scrollBy({ top: dir === 'down' ? step : -step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    refreshThumbScrollEdges()
  }, [galleryImages.length, resolvedColor, refreshThumbScrollEdges])

  useEffect(() => {
    const el = thumbListRef.current
    if (!el || !thumbStripClamped) return
    el.addEventListener('scroll', refreshThumbScrollEdges, { passive: true })
    const ro = new ResizeObserver(refreshThumbScrollEdges)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', refreshThumbScrollEdges)
      ro.disconnect()
    }
  }, [thumbStripClamped, refreshThumbScrollEdges])

  useEffect(() => {
    if (!thumbStripClamped || !currentImage) return
    const el = thumbListRef.current
    if (!el) return
    const idx = galleryImages.indexOf(currentImage)
    if (idx < 0) return
    el.querySelectorAll('button')[idx]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    })
  }, [thumbStripClamped, currentImage, galleryImages])

  const sizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter((v) => v.color === resolvedColor)
            .map((v) => normalizeSize(v.size))
        )
      ).toSorted(compareSizes),
    [variants, resolvedColor]
  )

  const firstAvailableSize = sizeOptions.find((size) =>
    variants.some(
      (v) =>
        v.color === resolvedColor &&
        normalizeSize(v.size) === size &&
        v.quantity > 0
    )
  )

  const resolvedSize = selection.size ?? firstAvailableSize ?? sizeOptions[0]

  const listPrice = product?.price ?? 0

  const selectedVariant = variants.find(
    (v) =>
      v.color === resolvedColor &&
      normalizeSize(v.size) === resolvedSize &&
      v.quantity > 0
  )

  const productDetails = useMemo(() => {
    if (!descriptionLayout?.specs?.length || !product) return []
    return [
      {
        label: 'Mã SP',
        value: (selectedVariant?.sku ?? product.productCode).toUpperCase()
      },
      ...descriptionLayout.specs.map((spec) => ({
        label: String(spec.label ?? ''),
        value: formatDescriptionSpecDisplayValue(String(spec.value ?? ''))
      }))
    ]
  }, [descriptionLayout, product, selectedVariant?.sku])

  const listCategory = categories.find((c) => c.id === product?.categoryId)
  const sizeGuideProfile =
    /quần/i.test(product?.categoryName ?? '') ||
    /quần/i.test(listCategory?.name ?? '')
      ? 'bottoms'
      : 'tops'
  const productCategoryListHref = listCategory
    ? toProductsCategorySearchUrl(listCategory)
    : `/products?category=${encodeURIComponent(
        product?.categorySlug?.trim()
          ? product.categorySlug
          : (product?.categoryId ?? '')
      )}`

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-80'>
        <p className='text-sm uppercase tracking-[0.2em] text-stone-400'>
          Loading…
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='flex items-center justify-center min-h-80'>
        <p className='text-sm uppercase tracking-[0.2em] text-stone-400'>
          Product not found
        </p>
      </div>
    )
  }

  return (
    <section>
      <nav className='flex flex-wrap items-center mb-8 text-xs font-medium gap-2 text-stone-400'>
        <Link
          to='/'
          className='text-stone-400! hover:text-stone-600 hover:underline!'
        >
          Home
        </Link>
        {categoryBreadcrumbs.length > 0 ? (
          categoryBreadcrumbs.map((item) => (
            <Fragment key={item.id}>
              <span className='text-stone-300'>/</span>
              <Link
                to={toProductsCategorySearchUrl(item)}
                className='text-stone-400! hover:text-stone-600 hover:underline!'
              >
                {item.name}
              </Link>
            </Fragment>
          ))
        ) : (
          <>
            <span className='text-stone-300'>/</span>
            <Link
              to={productCategoryListHref}
              className='text-stone-400! hover:text-stone-600 hover:underline!'
            >
              {product.category ?? product.categoryName}
            </Link>
          </>
        )}
        <span className='text-stone-300'>/</span>
        <span className='text-stone-600'>{toCapitalize(product.name)}</span>
      </nav>

      <div className='grid gap-12 lg:grid-cols-2'>
        <div className='space-y-4'>
          <div className='flex items-start gap-3 sm:gap-4'>
            {galleryImages.length > 1 ? (
              <div className='flex flex-col w-16 shrink-0 sm:w-20'>
                <div
                  ref={thumbListRef}
                  className={
                    thumbStripClamped
                      ? 'flex max-h-110 flex-col gap-2 overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden'
                      : 'flex flex-col gap-2'
                  }
                >
                  {galleryImages.map((image, idx) => {
                    const isActive = image === currentImage
                    return (
                      <button
                        key={`${image}-${idx}`}
                        type='button'
                        onClick={() => setSelection((p) => ({ ...p, image }))}
                        className={`relative size-16 shrink-0 overflow-hidden rounded-lg! border-none transition-all duration-200 sm:size-20 cursor-pointer ${
                          isActive
                            ? 'shadow-sm'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${idx + 1}`}
                          className='size-full rounded-lg! object-cover'
                        />
                        {isActive ? (
                          <span
                            className='pointer-events-none absolute inset-0 rounded-[inherit] bg-black/30!'
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
                {thumbStripClamped ? (
                  <div className='flex justify-center mt-2 gap-1'>
                    <button
                      type='button'
                      aria-label='Ảnh nhỏ phía trên'
                      disabled={ui.thumbScrollEdges.atTop}
                      onClick={() => scrollProductThumbs('up')}
                      className='flex items-center justify-center bg-white border cursor-pointer size-8 rounded-md transition-colors border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35'
                    >
                      <UpOutlined className='text-xs' />
                    </button>
                    <button
                      type='button'
                      aria-label='Ảnh nhỏ phía dưới'
                      disabled={ui.thumbScrollEdges.atBottom}
                      onClick={() => scrollProductThumbs('down')}
                      className='flex items-center justify-center bg-white border cursor-pointer size-8 rounded-md transition-colors border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35'
                    >
                      <DownOutlined className='text-xs' />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className='flex-1 min-w-0'>
              <Image.PreviewGroup items={galleryImages.map((src) => ({ src }))}>
                <div className='relative w-full overflow-hidden bg-white rounded-xl group aspect-square'>
                  <Image
                    src={currentImage}
                    alt={product.name}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]'
                    rootClassName='absolute inset-0 block h-full w-full [&_.ant-image]:h-full [&_.ant-image]:w-full [&_.ant-image-img]:h-full [&_.ant-image-img]:w-full [&_.ant-image-img]:object-cover'
                  />
                </div>
              </Image.PreviewGroup>
            </div>
          </div>
          {productDetails.length > 0 && (
            <div className='p-6 bg-white border rounded-lg border-stone-200'>
              <p className='mb-4 text-base font-semibold text-black'>
                Thông số kỹ thuật
              </p>
              <dl className='divide-y divide-stone-100'>
                {productDetails.map(({ label, value }, idx) => (
                  <div
                    key={`${label}-${idx}`}
                    className='flex items-start justify-between py-3 gap-4'
                  >
                    <dt className='text-xs! uppercase text-stone-600 shrink-0'>
                      {label}
                    </dt>
                    <dd className='text-sm font-medium text-stone-700 text-right max-w-[65%]'>
                      {label === 'SKU'
                        ? value
                        : value.split('\n').map((line, lineIdx) => (
                            <span
                              key={`${idx}-${lineIdx}`}
                              className='block leading-relaxed'
                            >
                              {line}
                            </span>
                          ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <aside className='w-full space-y-8 lg:sticky lg:top-8 lg:h-fit'>
          <div className='pb-4 border-b space-y-3 border-stone-200'>
            <h1 className='mt-3! text-3xl font-normal leading-snug tracking-tight text-stone-900'>
              {toCapitalize(product.name)}
            </h1>
            {selectedVariant?.sku && (
              <p className='text-sm text-stone-500'>
                SKU: {selectedVariant.sku}
              </p>
            )}
          </div>

          <div className='space-y-1'>
            {showSaleCountdown && saleEndDate ? (
              <div className='flex flex-wrap items-center justify-between w-full gap-4'>
                <span className='text-3xl font-semibold tabular-nums text-rose-700'>
                  {formatCurrency(product.salePrice ?? 0)}
                </span>
                <div className='flex flex-col items-center flex-1 p-2 bg-red-100 rounded-2xl min-w-40 shrink-0'>
                  <span className='text-[11px] font-medium uppercase tracking-wide text-stone-500'>
                    Kết thúc sau
                  </span>
                  <Timer
                    key={saleStatisticCountdownFormat}
                    type='countdown'
                    value={saleEndDate}
                    format={saleStatisticCountdownFormat}
                    onFinish={refreshSaleTimer}
                    classNames={{
                      root: '!m-0 !p-0 leading-tight',
                      content:
                        '!text-xl !font-semibold tabular-nums text-rose-600'
                    }}
                  />
                </div>
                <span className='text-lg font-medium line-through tabular-nums text-stone-400'>
                  {formatCurrency(listPrice)}
                </span>
              </div>
            ) : (
              <div className='flex items-baseline gap-3'>
                <span className='text-3xl font-semibold text-stone-900'>
                  {effectiveDisplayPrice !== listPrice
                    ? formatCurrency(effectiveDisplayPrice)
                    : formatCurrency(listPrice)}
                </span>
                {effectiveDisplayPrice !== listPrice && (
                  <span className='text-sm line-through text-stone-400'>
                    {formatCurrency(listPrice)}
                  </span>
                )}
              </div>
            )}
            <div className='flex items-baseline gap-3'>
              <img
                src='https://n7media.coolmate.me/uploads/2026/04/15/icon4.png'
                alt='Freeship'
                className='size-4'
              />
              <small className='text-xs text-stone-400'>
                Freeship đơn trên 200K
              </small>
            </div>
          </div>

          <div className='space-y-3'>
            <p className='text-sm font-semibold text-black'>
              Màu sắc:{' '}
              <span className='text-base font-medium tracking-normal normal-case text-stone-700'>
                {toCapitalize(resolvedColor ?? '-')}
              </span>
            </p>
            <div className='flex flex-wrap gap-2'>
              {colorOptions.map((color) => {
                const variant = variants.find((v) => v.color === color)
                const colorQty = variants
                  .filter((v) => v.color === color)
                  .reduce((sum, v) => sum + v.quantity, 0)
                const isDisabled = colorQty <= 0
                const isSelected = resolvedColor === color

                return (
                  <button
                    key={color}
                    type='button'
                    disabled={isDisabled}
                    onClick={() => {
                      setSelection((p) => ({
                        ...p,
                        color,
                        size: undefined,
                        quantity: 1,
                        image: ''
                      }))
                    }}
                    style={{ backgroundColor: variant?.hex ?? '#e5e7eb' }}
                    className={`relative h-7 w-12 rounded-full transition-all duration-150 border-2 ${
                      isSelected
                        ? 'border-blue-600 shadow-sm scale-110'
                        : 'border-stone-200'
                    } ${
                      isDisabled
                        ? 'opacity-30 cursor-not-allowed'
                        : 'cursor-pointer hover:border-stone-400'
                    }`}
                  >
                    {isDisabled && (
                      <span className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                        <span className='block h-px w-[80%] -rotate-12 bg-white mix-blend-difference' />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-semibold text-black m-0!'>
                Kích thước:{' '}
                <span className='text-base font-medium tracking-normal normal-case text-stone-700'>
                  {toCapitalize(resolvedSize ?? '-')}
                </span>
              </p>
              <button
                type='button'
                onClick={() => setUi((p) => ({ ...p, isSizeGuideOpen: true }))}
                className='text-xs! cursor-pointer text-blue-700! underline underline-offset-2 transition-colors hover:text-stone-600'
              >
                Hướng dẫn chọn size
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {sizeOptions.map((size) => {
                const sizeVariant = variants.find(
                  (v) =>
                    v.color === resolvedColor && normalizeSize(v.size) === size
                )
                const isDisabled = (sizeVariant?.quantity ?? 0) <= 0

                return (
                  <button
                    key={size}
                    type='button'
                    disabled={isDisabled}
                    onClick={() => {
                      setSelection((p) => ({ ...p, size, quantity: 1 }))
                    }}
                    className={`rounded-xl relative min-w-12 px-3 py-2 text-xs! font-semibold tracking-wider transition-all duration-150 ${
                      resolvedSize === size
                        ? 'bg-black text-white!'
                        : 'bg-stone-200 text-stone-600!'
                    } ${
                      isDisabled
                        ? 'cursor-not-allowed line-through opacity-45'
                        : 'cursor-pointer'
                    }`}
                  >
                    {size}
                    {isDisabled && (
                      <span className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                        <span className='block h-px w-[75%] -rotate-12 bg-stone-500' />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-3'>
            <CartQuantityControl
              value={selection.quantity}
              min={1}
              max={selectedVariant?.quantity ?? 1}
              onChange={(next) =>
                setSelection((p) => ({ ...p, quantity: next }))
              }
            />
            <p className='text-[11px] text-stone-400'>
              {selectedVariant?.quantity ?? 0} sản phẩm có sẵn
            </p>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Button
              type='default'
              disabled={!selectedVariant}
              onClick={() =>
                selectedVariant
                  ? dispatch(
                      addToCart({
                        product,
                        productVariantId: selectedVariant.id,
                        selectedSize: selectedVariant.size,
                        selectedColor: selectedVariant.color,
                        quantity: selection.quantity
                      })
                    )
                  : toast.error('Please select a valid color and size')
              }
              icon={<ShoppingOutlined />}
              size='large'
              className='w-full'
            >
              Thêm vào giỏ
            </Button>

            <Button
              type='primary'
              disabled={!selectedVariant}
              onClick={() => {
                if (!selectedVariant) {
                  toast.error('Please select a valid color and size')
                  return
                }
                dispatch(
                  addToCart({
                    product,
                    productVariantId: selectedVariant.id,
                    selectedSize: selectedVariant.size,
                    selectedColor: selectedVariant.color,
                    quantity: selection.quantity
                  })
                )
                navigate('/checkout')
              }}
              size='large'
              className='w-full'
            >
              Mua nhanh
            </Button>
          </div>

          <div className='mt-4 rounded-lg grid grid-cols-2 bg-stone-200'>
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
                className='flex items-center p-4 gap-2 text-start'
              >
                <img src={title} alt={title} className='size-9' />
                <p className='whitespace-pre-line text-xs text-stone-700 m-0!'>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className='w-full mt-8 bg-white'>
        <Tabs
          className='[&_.ant-tabs-nav]:mb-6 [&_.ant-tabs-nav-wrap]:w-full [&_.ant-tabs-nav-list]:flex [&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:m-0 [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:justify-center [&_.ant-tabs-tab-btn]:w-full [&_.ant-tabs-tab-btn]:text-center [&_.ant-tabs-tab]:py-3 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:font-semibold [&_.ant-tabs-ink-bar]:h-0.5'
          defaultActiveKey='description'
          items={[
            {
              key: 'description',
              label: 'Mô tả sản phẩm',
              children: (
                <div className='px-4 py-3 md:px-6 md:py-4'>
                  <div
                    className='prose prose-sm max-w-none text-stone-600 [&_img]:h-auto [&_img]:max-w-full'
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )
            },
            {
              key: 'reviews',
              label: 'Đánh giá sản phẩm',
              children: (
                <div className='px-4 py-3 md:px-6 md:py-4'>
                  <Suspense fallback={null}>
                    <ProductReviewsSection
                      productId={product.id}
                      productName={toCapitalize(product.name)}
                    />
                  </Suspense>
                </div>
              )
            }
          ]}
        />
      </div>

      {similarProducts.length > 0 ? (
        <div className='mt-12'>
          <div className='flex flex-wrap items-end justify-between mb-6 gap-4'>
            <h2 className='text-xl font-semibold tracking-tight text-stone-900 md:text-2xl'>
              Sản phẩm tương tự
            </h2>
            <Link
              to={productCategoryListHref}
              className='text-sm font-semibold shrink-0 hover:underline'
              style={{ color: '#8B2332' }}
            >
              Xem thêm trong danh mục
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'>
            {similarProducts.map((item) => (
              <ProductCard key={item.id} mode='catalog' product={item} />
            ))}
          </div>
        </div>
      ) : null}

      <Modal
        title='Hướng dẫn chọn size'
        open={ui.isSizeGuideOpen}
        onCancel={() => setUi((p) => ({ ...p, isSizeGuideOpen: false }))}
        footer={null}
        width={850}
      >
        <p className='mb-4 text-sm text-slate-600'>
          Dựa trên cân nặng và chiều cao của bạn để chọn size phù hợp nhất.
        </p>
        {sizeGuideProfile === 'tops' ? (
          <Table
            columns={MEASUREMENT_PRESETS.tops.columns}
            dataSource={MEASUREMENT_PRESETS.tops.data}
            pagination={false}
            size='small'
            rowKey='size'
            bordered
            className='overflow-hidden border rounded-xl border-slate-200'
          />
        ) : (
          <Table
            columns={MEASUREMENT_PRESETS.bottoms.columns}
            dataSource={MEASUREMENT_PRESETS.bottoms.data}
            pagination={false}
            size='small'
            rowKey='size'
            bordered
            className='overflow-hidden border rounded-xl border-slate-200'
          />
        )}
      </Modal>
    </section>
  )
}
