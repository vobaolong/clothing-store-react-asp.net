import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

const directionVariants: Record<Direction, Variants> = {
  up: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  },
  down: {
    hidden: { opacity: 0, y: -60 },
    visible: { opacity: 1, y: 0 }
  },
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 }
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 }
  }
}

type ScrollRevealProps = {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  once?: boolean
  className?: string
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  once = true,
  className = ''
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-80px' })

  const variants = directionVariants[direction]

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...variants.visible,
          transition: { duration, delay, ease: 'easeOut' as const }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
