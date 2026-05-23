import type { HomepageBanner } from '@/types'
import { FALLBACK_IMG } from '@/utils/error-handler'
import { Carousel } from 'antd'
import { Link } from 'react-router-dom'

const HomeHeroBanner = ({ banners }: { banners: HomepageBanner[] }) => (
  <section className='relative w-screen -translate-x-1/2 left-1/2'>
    <Carousel
      autoplay
      autoplaySpeed={4000}
      arrows
      draggable
      slidesToShow={1}
      slidesToScroll={1}
      dots={banners.length > 1}
      infinite={banners.length > 1}
      className='home-hero-carousel'
    >
      {banners.map((banner) => (
        <div key={banner.id}>
          <Link
            to={banner.ctaLink || '/products'}
            className='relative block overflow-hidden group'
          >
            <div className='relative w-full overflow-hidden aspect-14/5 '>
              <img
                src={banner.imageUrl}
                alt='Hero banner'
                className='object-cover w-full h-full'
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMG
                }}
              />
            </div>
          </Link>
        </div>
      ))}
    </Carousel>
  </section>
)

export default HomeHeroBanner
