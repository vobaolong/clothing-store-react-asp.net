import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getActiveBanners } from '@/api/banners-api'
import { getCategories, getProducts } from '@/api/products-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
  HomeHeroBanner,
  HomeProductRail,
  CategoryBrowser,
  CategoryGrid,
} from '@/components/home'

const HomePage = () => {
  const { data: products = [] } = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: getProducts,
  })
  const { data: activeBanners = [] } = useQuery({
    queryKey: QUERY_KEYS.homepageBanners,
    queryFn: getActiveBanners,
  })
  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories,
  })

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  )

  const featuredProducts = useMemo(
    () => [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 18),
    [products],
  )

  const newProducts = useMemo(
    () =>
      [...products]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 18),
    [products],
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
