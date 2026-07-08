import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Skeleton } from 'antd'
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
  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: getProducts
  })
  const bannersQuery = useQuery({
    queryKey: QUERY_KEYS.homepageBanners,
    queryFn: getActiveBanners
  })
  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories
  })

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const activeBanners = useMemo(
    () => bannersQuery.data ?? [],
    [bannersQuery.data]
  )
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  )

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

  const isLoading =
    productsQuery.isLoading ||
    bannersQuery.isLoading ||
    categoriesQuery.isLoading

  if (isLoading) {
    return (
      <main className="pb-10 space-y-12 min-h-screen">
        <Skeleton active className="w-full h-100!" />
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <Skeleton active paragraph={{ rows: 1 }} className="w-80!" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                active
                avatar
                className="flex-1!"
                paragraph={{ rows: 2 }}
              />
            ))}
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <Skeleton active paragraph={{ rows: 1 }} className="w-64!" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1">
                <Skeleton active className="aspect-square mb-2!" />
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <Skeleton active paragraph={{ rows: 1 }} className="w-64!" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1">
                <Skeleton active className="aspect-square mb-2!" />
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} active className="h-72!" />
            ))}
          </div>
        </section>
      </main>
    )
  }

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
