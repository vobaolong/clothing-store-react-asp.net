import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Carousel } from 'antd'
import { getActiveBanners } from '@/api/banners-api'
import { getCategories, getProducts } from '@/api/products-api'
import type { Category } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'
import { QUERY_KEYS } from '@/constants/query-keys'
import HomeHeroBanner from '@/components/home/HomeHeroBanner'
import HomeProductRail from '@/components/home/HomeProductRail'

interface CategoryBrowserProps {
  rootCategories: Category[]
  allCategories: Category[]
}

const CATEGORY_CAROUSEL_RESPONSIVE = [
  { breakpoint: 1279, settings: { slidesToShow: 4.3, slidesToScroll: 1 } },
  { breakpoint: 1023, settings: { slidesToShow: 3.2, slidesToScroll: 1 } },
  { breakpoint: 767, settings: { slidesToShow: 2.2, slidesToScroll: 1 } }
]

const CategoryBrowser = ({
  rootCategories,
  allCategories
}: CategoryBrowserProps) => {
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null)

  const activeRootId = selectedRootId ?? rootCategories[0]?.id ?? null

  const childCategories = useMemo(
    () => allCategories.filter((c) => c.parentId === activeRootId),
    [allCategories, activeRootId]
  )

  return (
    <section>
      <div className='flex flex-wrap gap-3 items-center mb-5'>
        {rootCategories.map(({ id, name }) => (
          <button
            key={id}
            onClick={() => setSelectedRootId(id)}
            className={`px-6 py-2 text-sm font-semibold uppercase rounded-full transition cursor-pointer ${
              id === activeRootId
                ? 'bg-red-800 text-white!'
                : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {childCategories.length > 0 && (
        <Carousel
          arrows
          draggable
          dots={false}
          slidesToShow={6}
          slidesToScroll={1}
          infinite={false}
          responsive={CATEGORY_CAROUSEL_RESPONSIVE}
          className='home-category-carousel'
        >
          {childCategories.map((cat) => (
            <div key={cat.id} className='px-1.75'>
              <Link
                to={toProductsCategorySearchUrl(cat)}
                className='block group'
              >
                <div className='overflow-hidden bg-white rounded-2xl'>
                  <img
                    src={cat.image || ''}
                    alt={cat.name}
                    className='object-cover w-full transition duration-300 h-54 group-hover:scale-105'
                    loading='lazy'
                  />
                </div>
                <p className='mt-2! mb-0! text-sm font-semibold text-center uppercase text-neutral-900'>
                  {cat.name}
                </p>
              </Link>
            </div>
          ))}
        </Carousel>
      )}
    </section>
  )
}

const CategoryGrid = ({ categories }: { categories: Category[] }) => (
  <section className='grid gap-4 md:grid-cols-2'>
    {categories.map(({ id, name, image }) => (
      <Link
        key={id}
        to={toProductsCategorySearchUrl({ id, name, image } as Category)}
        className='overflow-hidden relative rounded-2xl group'
      >
        <img
          src={image || ''}
          alt={name}
          className='object-cover w-full h-72 transition duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 to-transparent bg-linear-to-t from-black/60' />
        <div className='absolute bottom-5 left-5 text-white'>
          <h3 className='text-2xl font-bold uppercase'>{name}</h3>
          <span className='inline-flex py-2 px-5 mt-3 text-xs font-bold bg-white rounded-full text-neutral-900'>
            MUA NGAY
          </span>
        </div>
      </Link>
    ))}
  </section>
)

const FEATURED_PRODUCT_COUNT = 18

const HomePage = () => {
  const { data: products = [] } = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: getProducts
  })
  const { data: activeBanners = [] } = useQuery({
    queryKey: QUERY_KEYS.homepageBanners,
    queryFn: getActiveBanners
  })
  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories
  })

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  )

  const featuredProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, FEATURED_PRODUCT_COUNT),
    [products]
  )

  const newProducts = useMemo(
    () =>
      [...products]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, FEATURED_PRODUCT_COUNT),
    [products]
  )

  return (
    <main className='pb-10 space-y-8 min-h-screen'>
      <HomeHeroBanner banners={activeBanners} />

      <CategoryBrowser
        rootCategories={rootCategories}
        allCategories={categories}
      />

      <HomeProductRail
        title='Sản phẩm nổi bật'
        seeMoreTo='/products?sort=best-selling'
        products={featuredProducts}
      />
      <HomeProductRail
        title='Sản phẩm mới'
        seeMoreTo='/products?sort=newest'
        products={newProducts}
      />

      <CategoryGrid categories={rootCategories} />
    </main>
  )
}

export default HomePage
