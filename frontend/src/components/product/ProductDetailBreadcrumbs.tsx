import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'

interface ProductDetailBreadcrumbsProps {
  categoryBreadcrumbs: Array<{ id: string; name: string; slug: string }>
  productCategoryListHref: string
  categoryName: string | undefined
  productName: string
}

export default function ProductDetailBreadcrumbs({
  categoryBreadcrumbs,
  productCategoryListHref,
  categoryName,
  productName
}: ProductDetailBreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 mb-8 text-xs font-medium text-stone-400">
      <Link
        to="/"
        className="text-stone-400! hover:text-stone-600 hover:underline!"
      >
        Home
      </Link>
      {categoryBreadcrumbs.length > 0 ? (
        categoryBreadcrumbs.map((item) => (
          <Fragment key={item.id}>
            <span className="text-stone-300">/</span>
            <Link
              to={toProductsCategorySearchUrl(item)}
              className="text-stone-400! hover:text-stone-600 hover:underline!"
            >
              {item.name}
            </Link>
          </Fragment>
        ))
      ) : (
        <>
          <span className="text-stone-300">/</span>
          <Link
            to={productCategoryListHref}
            className="text-stone-400! hover:text-stone-600 hover:underline!"
          >
            {categoryName}
          </Link>
        </>
      )}
      <span className="text-stone-300">/</span>
      <span className="text-stone-600">{productName}</span>
    </nav>
  )
}
