import { DEFAULT_SIZES } from '@/constants/product'

export const normalizeSize = (size: string): string => size.trim().toUpperCase()

export const sizeRank = (
  size: string,
  defaultSizes: string[] = DEFAULT_SIZES,
): number => {
  const normalized = normalizeSize(size)
  const idx = defaultSizes.indexOf(normalized)
  return idx === -1 ? 999 : idx
}

export const compareSizes = (a: string, b: string): number => {
  const rankDiff = sizeRank(a) - sizeRank(b)
  if (rankDiff !== 0) return rankDiff
  return normalizeSize(a).localeCompare(normalizeSize(b))
}
