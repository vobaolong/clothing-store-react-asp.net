export type CategoryLike = {
  id: string
  name: string
  slug?: string | null
  parentId?: string | null
}

export function getCategoryAncestorChain<T extends CategoryLike>(
  categories: T[],
  categoryId: string | undefined | null
): T[] {
  if (!categoryId || categories.length === 0) return []
  const byId = new Map(categories.map((c) => [c.id, c]))
  const chain: T[] = []
  let cur: T | undefined = byId.get(categoryId)
  const guard = new Set<string>()
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id)
    chain.unshift(cur)
    const pid = cur.parentId
    cur = pid ? byId.get(pid) : undefined
  }
  return chain
}

export function categoryPathLabel<T extends CategoryLike>(
  categories: T[],
  categoryId: string | undefined | null
): string {
  if (!categoryId || categories.length === 0) return ''
  const category = categories.find((category) => category.id === categoryId)
  return category?.name ?? ''
}

export function categoryProductsQueryValue(category: CategoryLike): string {
  const slug = category.slug?.trim()
  return slug ? slug : category.id
}

export function toProductsCategorySearchUrl(category: CategoryLike): string {
  return `/products?category=${encodeURIComponent(categoryProductsQueryValue(category))}`
}

export type CategoryTreeNode = {
  title: string
  value: string
  children?: CategoryTreeNode[]
}

export function buildCategoryTreeSelectData<T extends CategoryLike>(
  categories: T[]
): CategoryTreeNode[] {
  const byParent = new Map<string | null, T[]>()
  for (const category of categories) {
    const key = category.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(category)
  }
  const sortFn = (categoryA: T, categoryB: T) =>
    categoryA.name.localeCompare(categoryB.name, 'vi')

  const build = (parentId: string | null): CategoryTreeNode[] => {
    const row = (byParent.get(parentId) ?? []).slice().sort(sortFn)
    return row.map((category) => {
      const kids = build(category.id)
      return {
        title: category.name,
        value: category.id,
        children: kids.length ? kids : undefined
      }
    })
  }

  return build(null)
}

export function removeCategorySubtreeFromTree(
  nodes: CategoryTreeNode[],
  rootIdToRemove: string
): CategoryTreeNode[] {
  const out: CategoryTreeNode[] = []
  for (const node of nodes) {
    if (node.value === rootIdToRemove) {
      continue
    }
    const children = node.children?.length
      ? removeCategorySubtreeFromTree(node.children, rootIdToRemove)
      : undefined
    out.push({
      title: node.title,
      value: node.value,
      ...(children?.length ? { children } : {})
    })
  }
  return out
}

export function collectDescendantCategoryIds<T extends CategoryLike>(
  rootId: string,
  categories: T[]
): Set<string> {
  const byParent = new Map<string, T[]>()
  for (const category of categories) {
    const parent = category.parentId
    if (parent == null || parent === '') continue
    if (!byParent.has(parent)) byParent.set(parent, [])
    byParent.get(parent)!.push(category)
  }
  const ids = new Set<string>([rootId])
  const queue = [rootId]
  while (queue.length > 0) {
    const id = queue.shift()!
    const children = byParent.get(id) ?? []
    for (const child of children) {
      if (!ids.has(child.id)) {
        ids.add(child.id)
        queue.push(child.id)
      }
    }
  }
  return ids
}

function resolveCategoryRootsFromParams<T extends CategoryLike>(
  paramValues: string[],
  categories: T[]
): T[] {
  const roots: T[] = []
  const seen = new Set<string>()
  for (const raw of paramValues) {
    const trimmed = raw.trim()
    const decoded = decodeURIComponent(trimmed)
    const cat = categories.find(
      (category) =>
        category.id === decoded ||
        category.id === trimmed ||
        (category.slug != null &&
          (category.slug === decoded || category.slug === trimmed)) ||
        category.name === decoded ||
        category.name === trimmed
    )
    if (cat != null && !seen.has(cat.id)) {
      seen.add(cat.id)
      roots.push(cat)
    }
  }
  return roots
}

export function getExpandedCategoryIdsForProductFilter<T extends CategoryLike>(
  selectedCategoryParams: string[],
  categories: T[]
): Set<string> | null | undefined {
  if (selectedCategoryParams.length === 0) return null
  if (categories.length === 0) return undefined

  const roots = resolveCategoryRootsFromParams(
    selectedCategoryParams,
    categories
  )
  if (roots.length === 0) return new Set<string>()

  const merged = new Set<string>()
  for (const root of roots) {
    collectDescendantCategoryIds(root.id, categories).forEach((id) =>
      merged.add(id)
    )
  }
  return merged
}

export function buildCategoryFilterTreeRows<T extends CategoryLike>(
  categories: T[]
): Array<{ label: string; value: string; depth: number }> {
  const byParent = new Map<string | null, T[]>()
  for (const category of categories) {
    const key = category.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(category)
  }
  for (const [, row] of byParent) {
    row.sort((categoryA, categoryB) =>
      categoryA.name.localeCompare(categoryB.name, 'vi')
    )
  }

  const out: Array<{ label: string; value: string; depth: number }> = []
  const walk = (parentId: string | null, depth: number) => {
    const row = byParent.get(parentId) ?? []
    for (const category of row) {
      out.push({
        label: category.name,
        value: category.slug?.trim() ? category.slug : category.id,
        depth
      })
      walk(category.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

export function resolvedCategoryIdsFromQueryParams<T extends CategoryLike>(
  params: string[],
  categories: T[]
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of params) {
    const roots = resolveCategoryRootsFromParams([raw], categories)
    if (roots.length > 0) {
      const cat = roots[0]
      const key = cat.slug?.trim() ? cat.slug : cat.id
      if (!seen.has(key)) {
        seen.add(key)
        out.push(key)
      }
    } else {
      const trimmed = raw.trim()
      if (!seen.has(trimmed)) {
        seen.add(trimmed)
        out.push(trimmed)
      }
    }
  }
  return out
}

export function categoryChipLabelFromQueryParam<T extends CategoryLike>(
  param: string,
  categories: T[]
): string {
  const roots = resolveCategoryRootsFromParams([param], categories)
  return roots.length > 0 ? roots[0].name : param
}

export function legacyProductCategoryParamMatch(
  categoryId: string | undefined,
  categorySlug: string | undefined,
  categoryLabel: string | undefined,
  categoryName: string | undefined,
  selectedParams: string[]
): boolean {
  if (
    categoryId != null &&
    categoryId !== '' &&
    selectedParams.includes(categoryId)
  )
    return true
  const primary = categorySlug || categoryLabel || categoryName || ''
  const secondary = categoryLabel || categoryName || ''
  return (
    selectedParams.includes(primary) ||
    selectedParams.includes(secondary) ||
    selectedParams.some((params) => {
      const trimmed = params.trim()
      const decoded = decodeURIComponent(trimmed)
      return (
        primary === decoded ||
        secondary === decoded ||
        primary === trimmed ||
        secondary === trimmed
      )
    })
  )
}
