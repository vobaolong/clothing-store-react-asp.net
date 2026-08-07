import { Image } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProductSelection } from '@/types/product.type'
import { useTranslation } from 'react-i18next'

type Props = {
  galleryImages: string[]
  selection: ProductSelection
  setSelection: React.Dispatch<React.SetStateAction<ProductSelection>>
  productName: string
}

export default function ProductGallery({
  galleryImages,
  selection,
  setSelection,
  productName
}: Props) {
  const { t } = useTranslation()
  const thumbListRef = useRef<HTMLDivElement | null>(null)
  const [thumbScrollEdges, setThumbScrollEdges] = useState({
    atTop: true,
    atBottom: true
  })

  const thumbStripClamped = galleryImages.length > 6

  const refreshThumbScrollEdges = useCallback(() => {
    const el = thumbListRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setThumbScrollEdges({
      atTop: scrollTop <= 1,
      atBottom: scrollTop + clientHeight >= scrollHeight - 1
    })
  }, [])

  const scrollProductThumbs = useCallback((dir: 'up' | 'down') => {
    const el = thumbListRef.current
    if (!el) return
    const first = el.querySelector('button')
    const gap = 8
    const step = first
      ? (first as HTMLElement).getBoundingClientRect().height + gap
      : 88
    el.scrollBy({ top: dir === 'down' ? step : -step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    refreshThumbScrollEdges()
  }, [galleryImages.length, refreshThumbScrollEdges])

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

  const currentImage = galleryImages.length
    ? galleryImages.includes(selection.image)
      ? selection.image
      : galleryImages[0]
    : ''

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

  return (
    <div className="flex items-start gap-3 sm:gap-4">
      {galleryImages.length > 1 ? (
        <div className="flex flex-col w-16 shrink-0 sm:w-20">
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
                  type="button"
                  onClick={() => setSelection((p) => ({ ...p, image }))}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-lg! border-none transition-all duration-200 sm:size-20 cursor-pointer ${
                    isActive ? 'shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productName} ${idx + 1}`}
                    className="size-full rounded-lg! object-cover"
                  />
                  {isActive ? (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black/30!"
                      aria-hidden
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
          {thumbStripClamped ? (
            <div className="flex justify-center mt-2 gap-1">
              <button
                type="button"
                aria-label={t('product.thumbnailTop')}
                disabled={thumbScrollEdges.atTop}
                onClick={() => scrollProductThumbs('up')}
                className="flex items-center justify-center bg-white border cursor-pointer rounded-md transition-colors size-8 border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <UpOutlined className="text-xs" />
              </button>
              <button
                type="button"
                aria-label={t('product.thumbnailBottom')}
                disabled={thumbScrollEdges.atBottom}
                onClick={() => scrollProductThumbs('down')}
                className="flex items-center justify-center bg-white border cursor-pointer rounded-md transition-colors size-8 border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <DownOutlined className="text-xs" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex-1 min-w-0">
        <Image.PreviewGroup items={galleryImages.map((src) => ({ src }))}>
          <div className="relative w-full overflow-hidden bg-white rounded-xl group aspect-square">
            <Image
              src={currentImage}
              alt={productName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              rootClassName="absolute inset-0 block h-full w-full [&_.ant-image]:h-full [&_.ant-image]:w-full [&_.ant-image-img]:h-full [&_.ant-image-img]:w-full [&_.ant-image-img]:object-cover"
            />
          </div>
        </Image.PreviewGroup>
      </div>
    </div>
  )
}
