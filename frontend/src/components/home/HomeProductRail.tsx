import { Carousel } from 'antd'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import ProductCard from '@/components/ProductCard'

const SEE_MORE = '#8B2332'

type HomeProductRailProps = {
  title: string
  seeMoreTo: string
  products: Product[]
}

export default function HomeProductRail({
  title,
  seeMoreTo,
  products
}: HomeProductRailProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section>
      <div className='flex items-end justify-between mb-4 gap-4'>
        <h2 className='text-xl font-bold tracking-tight text-stone-900 md:text-2xl'>
          {title}
        </h2>
        <Link
          to={seeMoreTo}
          className='text-sm font-semibold shrink-0 hover:underline'
          style={{ color: SEE_MORE }}
        >
          Xem Thêm
        </Link>
      </div>
      <Carousel
        arrows
        draggable
        dots={false}
        slidesToShow={4}
        slidesToScroll={1}
        infinite={false}
        responsive={[
          {
            breakpoint: 1279,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 1023,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 639,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 479,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]}
        className='pb-1 home-product-carousel'
      >
        {products.map((product) => (
          <div key={product.id} className='h-full px-2'>
            <ProductCard product={product} mode='catalog' />
          </div>
        ))}
      </Carousel>
    </section>
  )
}
