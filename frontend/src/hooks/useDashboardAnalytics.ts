import { useMemo } from 'react'
import type {
  AdminCategory,
  AdminOrder,
  AdminProduct,
  AnalyticsPoint,
  CategoryRadarData,
  OrderOverview,
  Coupon
} from '@/types'

type RevenueGranularity = 'day' | 'week' | 'month' | 'year'

function formatDayLabel(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getWeekKey(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, '0')}-${String(copy.getDate()).padStart(2, '0')}`
}

function buildAnalytics(
  orders: AdminOrder[],
  granularity: RevenueGranularity
): AnalyticsPoint[] {
  const map = new Map<string, { revenue: number; label: string }>()
  for (const order of orders) {
    const date = new Date(order.createdAt)
    const key =
      granularity === 'day'
        ? order.createdAt.slice(0, 10)
        : granularity === 'week'
          ? getWeekKey(date)
          : granularity === 'month'
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            : String(date.getFullYear())
    const label =
      granularity === 'day'
        ? formatDayLabel(order.createdAt)
        : granularity === 'week'
          ? `W ${formatDayLabel(key)}`
          : granularity === 'month'
            ? `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
            : String(date.getFullYear())
    const bucket = map.get(key) ?? { revenue: 0, label }
    bucket.revenue += order.totalAmount
    map.set(key, bucket)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => ({
      date: value.label,
      revenue: value.revenue
    }))
}

function buildCategoryRadarData(
  categories: AdminCategory[],
  products: AdminProduct[],
  selectedParentName: string | null = null
): CategoryRadarData[] {
  const byId = new Map(categories.map((category) => [category.id, category]))
  const byName = new Map(
    categories.map((category) => [category.name, category])
  )
  const totals = new Map<string, number>()

  if (!selectedParentName) {
    const parentCategories = categories.filter(
      (category) => category.parentId === null
    )
    for (const parent of parentCategories) totals.set(parent.name, 0)
    for (const product of products) {
      const category = byId.get(product.categoryId)
      if (!category) continue
      const parentName = category.parentId
        ? byId.get(category.parentId)?.name
        : category.name
      if (!parentName) continue
      totals.set(
        parentName,
        (totals.get(parentName) ?? 0) + (product.soldCount ?? 0)
      )
    }
  } else {
    const parentCategory = byName.get(selectedParentName)
    if (!parentCategory) return []

    const childCategories = categories.filter(
      (category) => category.parentId === parentCategory.id
    )
    for (const child of childCategories) totals.set(child.name, 0)
    totals.set('Trực tiếp', 0)

    for (const product of products) {
      const category = byId.get(product.categoryId)
      if (!category) continue
      if (category.parentId === parentCategory.id) {
        totals.set(
          category.name,
          (totals.get(category.name) ?? 0) + (product.soldCount ?? 0)
        )
      } else if (category.id === parentCategory.id) {
        totals.set(
          'Trực tiếp',
          (totals.get('Trực tiếp') ?? 0) + (product.soldCount ?? 0)
        )
      }
    }

    if (totals.get('Trực tiếp') === 0) totals.delete('Trực tiếp')
  }

  return Array.from(totals.entries()).map(([categoryName, value]) => ({
    categoryName,
    value
  }))
}

interface UseDashboardAnalyticsProps {
  products: AdminProduct[]
  categories: AdminCategory[]
  orders: AdminOrder[]
  coupons: Coupon[]
  granularity: RevenueGranularity
  selectedRadarParent: string | null
}

export function useDashboardAnalytics({
  products,
  categories,
  orders,
  coupons,
  granularity,
  selectedRadarParent
}: UseDashboardAnalyticsProps) {
  const stats = useMemo(
    () => ({
      products: products.length,
      categories: categories.length,
      orders: orders.length,
      coupons: coupons.length
    }),
    [products.length, categories.length, orders.length, coupons.length]
  )

  const analyticsData = useMemo(
    () => buildAnalytics(orders, granularity),
    [orders, granularity]
  )

  const categoryRadarData = useMemo(
    () => buildCategoryRadarData(categories, products, selectedRadarParent),
    [categories, products, selectedRadarParent]
  )

  const orderOverviewData = useMemo<OrderOverview[]>(
    () =>
      orders
        .map((order) => ({
          id: order.id,
          customerEmail: order.userEmail,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10),
    [orders]
  )

  const mostSoldProducts = useMemo(
    () =>
      products
        .map((product) => ({
          id: product.id,
          name: product.name,
          category: product.categoryName,
          soldCount: product.soldCount ?? 0
        }))
        .filter((product) => product.soldCount > 0)
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 10),
    [products]
  )

  return {
    stats,
    analyticsData,
    categoryRadarData,
    orderOverviewData,
    mostSoldProducts
  }
}
