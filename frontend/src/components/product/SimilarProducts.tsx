import { Link } from 'react-router-dom'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'
import { useTranslation } from 'react-i18next'

interface SimilarProductsProps {
  products: Product[]
  listHref: string
}

export default function SimilarProducts({
  products,
  listHref
}: SimilarProductsProps) {
  if (products.length === 0) return null
  const { t } = useTranslation()

  return (
    <div className="mt-12">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold md:text-2xl">{t('product.relatedProducts')}</h2>
        <Link
          to={listHref}
          className="shrink-0 text-sm font-semibold hover:underline!"
        >
          {t('product.viewMoreInCategory')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} mode="catalog" product={item} />
        ))}
      </div>
    </div>
  )
}
