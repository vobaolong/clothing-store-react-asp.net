import { Link } from 'react-router-dom'
import type { Category } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'

export default function CategoryGrid({
  categories,
}: {
  categories: Category[]
}) {
  return (
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
}
