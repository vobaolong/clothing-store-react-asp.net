import type { AdminCategory, AdminProduct } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'
import { lp } from '@/utils/language-path'

export type BannerCtaDestination = 'category' | 'product' | 'search' | 'custom'

export type ParsedBannerCta = {
  destination: BannerCtaDestination
  categoryId?: string
  productId?: string
  searchKeyword?: string
  customUrl?: string
}

export function resolveCategoryIdFromParam(
  param: string,
  categories: AdminCategory[]
): string | undefined {
  const decoded = decodeURIComponent(param.trim())
  const found = categories.find(
    (c) =>
      c.id === decoded ||
      c.slug === decoded ||
      c.name === decoded ||
      c.id === param.trim() ||
      c.slug === param.trim()
  )
  return found?.id
}

export function parseBannerCta(
  link: string,
  categories: AdminCategory[],
  products: AdminProduct[]
): ParsedBannerCta {
  const raw = link.trim()
  if (!raw) {
    return { destination: 'custom', customUrl: '/products' }
  }

  let pathname = ''
  let searchParams: URLSearchParams

  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw)
      pathname = u.pathname
      searchParams = u.searchParams
    } else {
      const qIndex = raw.indexOf('?')
      pathname = qIndex >= 0 ? raw.slice(0, qIndex) : raw
      const qs = qIndex >= 0 ? raw.slice(qIndex + 1) : ''
      searchParams = new URLSearchParams(qs)
    }
  } catch {
    return { destination: 'custom', customUrl: raw }
  }

  const norm = pathname.replace(/\/+$/, '') === '' ? '/' : pathname.replace(/\/+$/, '')
    // Strip language prefix for parsing (e.g. /vi/products → /products)
    const stripped = norm.replace(/^\/\w{2}(\/|$)/, '/')

  if (stripped === '/products') {
    const cat = searchParams.get('category')
    if (cat != null && cat !== '') {
      const categoryId = resolveCategoryIdFromParam(cat, categories)
      return { destination: 'category', categoryId }
    }
    const search = searchParams.get('search')
    if (search != null && search !== '') {
      return { destination: 'search', searchKeyword: search }
    }
    return { destination: 'custom', customUrl: raw }
  }

  if (stripped.startsWith('/products/')) {
    const rest = stripped.slice('/products/'.length)
    const slug = decodeURIComponent(rest.split('/')[0] ?? '').trim()
    if (slug) {
      const product = products.find(
        (p) =>
          p.slug === slug ||
          encodeURIComponent(p.slug) === slug ||
          p.slug === encodeURIComponent(slug)
      )
      return {
        destination: 'product',
        productId: product?.id,
        customUrl: raw
      }
    }
  }

  return { destination: 'custom', customUrl: raw }
}

export function buildBannerCtaLink(
  destination: BannerCtaDestination,
  categoryId: string | undefined,
  productId: string | undefined,
  searchKeyword: string | undefined,
  customUrl: string | undefined,
  categories: AdminCategory[],
  products: AdminProduct[]
): string {
  switch (destination) {
    case 'category': {
      const cat = categories.find((c) => c.id === categoryId)
      return cat ? toProductsCategorySearchUrl(cat) : '/products'
    }
    case 'product': {
      const p = products.find((pr) => pr.id === productId)
      return p ? lp(`/products/${encodeURIComponent(p.slug)}`) : lp('/products')
    }
    case 'search': {
      const q = (searchKeyword ?? '').trim()
      return q ? lp(`/products?search=${encodeURIComponent(q)}`) : lp('/products')
    }
    case 'custom':
    default:
      return lp((customUrl ?? '/products').trim() || '/products')
  }
}
