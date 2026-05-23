import { useEffect, useRef, useState } from 'react'

export interface UseHeaderVisibilityOptions {
  disabled?: boolean
  threshold?: number
  offset?: number
}

export function useHeaderVisibility({
  disabled = false,
  threshold = 5,
  offset = 100
}: UseHeaderVisibilityOptions = {}) {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(window.scrollY)

  useEffect(() => {
    if (disabled) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 0) {
        setVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      const diff = currentScrollY - lastScrollY.current
      if (Math.abs(diff) < threshold) return

      setVisible(diff < 0 || currentScrollY <= offset)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [disabled, threshold, offset])

  return visible
}
