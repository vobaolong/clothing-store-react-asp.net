import { useMemo, useState } from 'react'
import { Carousel } from 'antd'
import { Link } from 'react-router-dom'
import type { Category } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'
import ScrollReveal from '@/components/animations/ScrollReveal'

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
    <ScrollReveal direction="up" className="relative">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-200 h-75 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap gap-3 items-center mb-5 relative z-10">
        {rootCategories.map(({ id, name }) => (
          <button
            onClick={() => setSelectedRootId(id)}
            className={`px-6 py-2 text-sm font-semibold uppercase rounded-full transition-all duration-300 cursor-pointer ${
              id === activeRootId
                ? 'bg-red-800 dark:bg-red-700 text-white! scale-105 shadow-lg shadow-red-800/30'
                : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 hover:scale-105 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600'
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
          className="home-hero-carousel relative z-10"
        >
          {childCategories.map((cat) => (
            <div key={cat.id} className="px-2 pt-4">
              <Link
                to={toProductsCategorySearchUrl(cat)}
                className="block group"
              >
                <div className="overflow-hidden bg-white dark:bg-neutral-800 dark:border dark:border-neutral-700 rounded-2xl shadow-xs dark:shadow-neutral-900/50 transition-all duration-300 hover:scale-105">
                  <img
                    src={cat.image || ''}
                    alt={cat.name}
                    className="object-cover w-full transition duration-500 h-54"
                    loading="lazy"
                  />
                </div>
                <p className="mt-4! mb-0 text-sm font-semibold text-center uppercase text-neutral-900 dark:text-neutral-100 group-hover:text-red-800 transition-colors duration-300">
                  {cat.name}
                </p>
              </Link>
            </div>
          ))}
        </Carousel>
      )}
    </ScrollReveal>
  )
}
