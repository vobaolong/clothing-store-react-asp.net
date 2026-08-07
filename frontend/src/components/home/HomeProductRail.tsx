import { Carousel } from 'antd'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product } from '@/types'
import ProductCard from '@/components/ProductCard'
import ScrollReveal from '@/components/animations/ScrollReveal'

const SEE_MORE = '#8B2332'

type HomeProductRailProps = {
  title: string
  seeMoreTo: string
  products: Product[]
}

const carouselResponsive = [
  { breakpoint: 1279, settings: { slidesToShow: 3, slidesToScroll: 1 } },
  { breakpoint: 1023, settings: { slidesToShow: 2, slidesToScroll: 1 } },
  { breakpoint: 767, settings: { slidesToShow: 1, slidesToScroll: 1 } },
  { breakpoint: 639, settings: { slidesToShow: 1, slidesToScroll: 1 } },
  { breakpoint: 479, settings: { slidesToShow: 1, slidesToScroll: 1 } }
]

export default function HomeProductRail({
  title,
  seeMoreTo,
  products
}: HomeProductRailProps) {
  const { t } = useTranslation()

  if (products.length === 0) {
    return null
  }

  return (
    <ScrollReveal direction="up">
      <section>
        <div className="flex items-end justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {title}
          </h2>
          <Link
            to={seeMoreTo}
            className="text-sm font-semibold shrink-0 hover:underline"
            style={{ color: SEE_MORE }}
          >
            {t('common.viewAll')}
          </Link>
        </div>

        <Carousel
          arrows
          draggable
          dots={false}
          slidesToShow={4}
          slidesToScroll={1}
          infinite={false}
          responsive={carouselResponsive}
          className="pb-1 home-hero-carousel"
        >
          {products.map((product) => (
            <div key={product.id} className="h-full px-2">
              <ProductCard product={product} mode="catalog" />
            </div>
          ))}
        </Carousel>
      </section>
    </ScrollReveal>
  )
}
