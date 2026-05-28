import type { Product } from '@/types/product.type'

const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  [
    'pyjama',
    'pijama',
    'pajama',
    'pj',
    'đồ ngủ',
    'đồ ngủ nam',
    'đồ ngủ nữ',
    'bộ ngủ',
    'sleepwear',
    'nightwear',
    'loungewear',
  ],
  ['t-shirt', 'tshirt', 'tee', 'áo thun', 'thun', 'polo', 'áo polo'],
  ['jean', 'jeans', 'quần jean', 'quần bò', 'denim'],
  ['hoodie', 'áo hoodie', 'áo nỉ', 'sweatshirt', 'nỉ'],
  ['short', 'shorts', 'quần short', 'quần đùi'],
  ['jogger', 'joggers', 'quần jogger', 'quần thể thao'],
]

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandSearchTerms(query: string): Set<string> {
  const queryLower = query.trim().toLowerCase()
  const out = new Set<string>()
  if (!queryLower) return out

  for (const group of SYNONYM_GROUPS) {
    const lower = group.map((groupItem) => groupItem.toLowerCase())
    const hit = lower.some((term) => {
      if (queryLower === term) return true
      if (term.length >= 2 && queryLower.includes(term)) return true
      if (queryLower.length >= 2 && term.includes(queryLower)) return true
      return false
    })
    if (hit) {
      lower.forEach((term) => {
        if (term.length > 0) out.add(term)
      })
    }
  }
  return out
}

export function buildProductSearchHaystack(product: Product): string {
  const parts = [
    product.name,
    stripHtml(product.description ?? ''),
    stripHtml(product.descriptionData ?? ''),
    product.productCode,
    product.categoryName,
    product.category ?? '',
    product.categorySlug ?? '',
    ...(product.categoryBreadcrumbs?.map(
      (breadcrumb) => `${breadcrumb.name} ${breadcrumb.slug}`,
    ) ?? []),
    ...product.variants.map((variant) => `${variant.size} ${variant.color}`),
  ]
  return parts.join(' ').toLowerCase()
}

export function productMatchesSearch(
  product: Product,
  rawQuery: string,
): boolean {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return true

  const haystack = buildProductSearchHaystack(product)
  if (haystack.includes(query)) return true

  const expanded = expandSearchTerms(query)
  for (const term of expanded) {
    if (haystack.includes(term)) return true
  }
  return false
}
