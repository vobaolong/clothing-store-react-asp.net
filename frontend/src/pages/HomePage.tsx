import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getActiveBanners } from '@/api/banners-api'
import { getCategories, getProducts } from '@/api/products-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import {
  HomeHeroBanner,
  HomeProductRail,
  CategoryBrowser,
  CategoryGrid,
  NewsletterSection,
  TrustBadges
} from '@/components/home'
import { useTranslation } from 'react-i18next'

const HomePage = () => {
  const { t } = useTranslation()
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
    () => [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 18),
    [products]
  )

  const newProducts = useMemo(
    () =>
      [...products]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 18),
    [products]
  )

  return (
    <main className="pb-10 space-y-12 min-h-screen">
      <HomeHeroBanner banners={activeBanners} />

      <CategoryBrowser
        rootCategories={rootCategories}
        allCategories={categories}
      />

      <HomeProductRail
        title={t('home.featuredProducts')}
        seeMoreTo="/products?sort=best-selling"
        products={featuredProducts}
      />
      <HomeProductRail
        title={t('home.newArrivals')}
        seeMoreTo="/products?sort=newest"
        products={newProducts}
      />

      <NewsletterSection />

      <CategoryGrid categories={rootCategories} />

      <TrustBadges />
    </main>
  )
}

export default HomePage
