import { useMemo, useState } from 'react'
import { Carousel } from 'antd'
import { Link } from 'react-router-dom'
import type { Category } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'

const CATEGORY_CAROUSEL_RESPONSIVE = [
  { breakpoint: 1279, settings: { slidesToShow: 4.3, slidesToScroll: 1 } },
  { breakpoint: 1023, settings: { slidesToShow: 3.2, slidesToScroll: 1 } },
  { breakpoint: 767, settings: { slidesToShow: 2.2, slidesToScroll: 1 } }
]

export default function CategoryBrowser({
  rootCategories,
  allCategories
}: {
  rootCategories: Category[]
  allCategories: Category[]
}) {
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null)
  const activeRootId = selectedRootId ?? rootCategories[0]?.id ?? null

  const childCategories = useMemo(
    () => allCategories.filter((c) => c.parentId === activeRootId),
    [allCategories, activeRootId]
  )

  return (
    <section>
      <div className="flex flex-wrap gap-3 items-center mb-5">
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
          className="home-category-carousel"
        >
          {childCategories.map((cat) => (
            <div key={cat.id} className="px-2">
              <Link
                to={toProductsCategorySearchUrl(cat)}
                className="block group"
              >
                <div className="overflow-hidden bg-white rounded-2xl">
                  <img
                    src={cat.image || ''}
                    alt={cat.name}
                    className="object-cover w-full transition duration-300 h-54 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 mb-0 text-sm font-semibold text-center uppercase text-neutral-900">
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
