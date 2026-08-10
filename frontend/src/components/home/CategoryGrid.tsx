import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'
import ScrollReveal from '@/components/animations/ScrollReveal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const }
  }
}

export default function CategoryGrid({
  categories
}: {
  categories: Category[]
}) {
  if (categories.length === 0) return null

  return (
    <ScrollReveal>
      <motion.section
        className="grid gap-4 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {categories.map(({ id, name, image }) => (
          <motion.div key={id} variants={itemVariants}>
            <Link
              to={toProductsCategorySearchUrl({ id, name, image } as Category)}
              className="relative block overflow-hidden rounded-2xl group"
            >
              <div className="w-full overflow-hidden h-72">
                <img
                  src={image || ''}
                  alt={name}
                  className="object-cover w-full h-full transition duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

              <div className="absolute text-white bottom-5 left-5">
                <h3 className="text-2xl font-bold uppercase drop-shadow-lg">
                  {name}
                </h3>
                <span className="inline-flex px-5 py-2 mt-3 text-xs font-bold bg-white rounded-full text-neutral-900 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  MUA NGAY
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </ScrollReveal>
  )
}
