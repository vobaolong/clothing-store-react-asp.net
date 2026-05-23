import { useQuery } from '@tanstack/react-query'
import {
  AppstoreOutlined,
  FolderOutlined,
  TagsOutlined
} from '@ant-design/icons'
import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Segmented,
  Skeleton,
  Statistic,
  Table,
  Button
} from 'antd'
import { useMemo, useState } from 'react'
import {
  getAdminCategories,
  getAdminOrders,
  getAdminProducts
} from '@/api/admin-api'
import { getAdminCoupons } from '@/api/coupons-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { AdminNavKey, FilterStatus } from '@/enums'
import type {
  AdminCategory,
  AdminOrder,
  AdminProduct,
  AnalyticsPoint,
  CategoryRadarData,
  OrderOverview,
  Coupon
} from '@/types'
import AnalyticsAreaChart from '@/features/admin/components/Dashboard/AnalyticsAreaChart'
import CategoryRadarChart from '@/features/admin/components/Dashboard/CategoryRadarChart'
import OrdersTable from '@/features/admin/components/Dashboard/OrdersTable'

const CHART_HEIGHT = 280
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

    if (totals.get('Trực tiếp') === 0) {
      totals.delete('Trực tiếp')
    }
  }

  return Array.from(totals.entries()).map(([categoryName, value]) => ({
    categoryName,
    value
  }))
}

import { useAdmin } from '@/features/admin/context/AdminContext'

export default function AdminDashboardSection() {
  const { navigate } = useAdmin()
  const [granularity, setGranularity] = useState<RevenueGranularity>('day')
  const [selectedRadarParent, setSelectedRadarParent] = useState<string | null>(
    null
  )

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.adminProducts,
    queryFn: getAdminProducts
  })
  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.adminCategories,
    queryFn: getAdminCategories
  })
  const ordersQuery = useQuery({
    queryKey: QUERY_KEYS.adminOrders(FilterStatus.ALL),
    queryFn: () => getAdminOrders(FilterStatus.ALL)
  })
  const couponsQuery = useQuery<Coupon[]>({
    queryKey: QUERY_KEYS.adminCoupons,
    queryFn: () => getAdminCoupons()
  })

  const loading =
    productsQuery.isLoading ||
    categoriesQuery.isLoading ||
    ordersQuery.isLoading ||
    couponsQuery.isLoading
  const hasError =
    productsQuery.isError ||
    categoriesQuery.isError ||
    ordersQuery.isError ||
    couponsQuery.isError

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  )
  const orders = useMemo(
    () => ordersQuery.data?.orders ?? [],
    [ordersQuery.data]
  )
  const coupons = useMemo(() => couponsQuery.data ?? [], [couponsQuery.data])

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

  const mostSoldColumns = useMemo(
    () => [
      {
        title: '#',
        key: 'stt',
        width: 60,
        align: 'center' as const,
        render: (_: unknown, __: unknown, index: number) => index + 1
      },
      { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
      {
        title: 'Đã bán',
        dataIndex: 'soldCount',
        className: 'truncate',
        key: 'soldCount',
        align: 'right' as const
      }
    ],
    []
  )

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />

  if (hasError) {
    return (
      <Alert type='error' title='Không thể tải dữ liệu dashboard' showIcon />
    )
  }

  return (
    <div className='space-y-6!'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Card
          hoverable
          className='cursor-pointer rounded-xl border-slate-200 shadow-sm transition-shadow hover:shadow-md'
          onClick={() => navigate(`/admin/${AdminNavKey.PRODUCTS}`)}
        >
          <Statistic
            title='Sản phẩm'
            value={stats.products}
            prefix={<AppstoreOutlined className='text-indigo-500!' />}
          />
        </Card>
        <Card
          hoverable
          className='cursor-pointer rounded-xl border-slate-200 shadow-sm transition-shadow hover:shadow-md'
          onClick={() => navigate(`/admin/${AdminNavKey.CATEGORIES}`)}
        >
          <Statistic
            title='Danh mục'
            value={stats.categories}
            prefix={<FolderOutlined className='text-teal-500!' />}
          />
        </Card>
        <Card
          hoverable
          className='cursor-pointer rounded-xl border-slate-200 shadow-sm transition-shadow hover:shadow-md'
          onClick={() => navigate(`/admin/${AdminNavKey.ORDERS}`)}
        >
          <Statistic
            title='Đơn hàng'
            value={stats.orders}
            prefix={<TagsOutlined className='text-amber-500!' />}
          />
        </Card>
        <Card
          hoverable
          className='cursor-pointer rounded-xl border-slate-200 shadow-sm transition-shadow hover:shadow-md'
          onClick={() => navigate(`/admin/${AdminNavKey.COUPONS}`)}
        >
          <Statistic
            title='Voucher'
            value={stats.coupons}
            prefix={<TagsOutlined className='text-violet-500!' />}
          />
        </Card>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title='Tổng doanh thu'
            className='h-full rounded-xl border-slate-200'
            extra={
              <Segmented<RevenueGranularity>
                value={granularity}
                onChange={setGranularity}
                options={[
                  { label: 'Ngày', value: 'day' },
                  { label: 'Tuần', value: 'week' },
                  { label: 'Tháng', value: 'month' },
                  { label: 'Năm', value: 'year' }
                ]}
              />
            }
          >
            {analyticsData.length ? (
              <AnalyticsAreaChart
                data={analyticsData}
                height={CHART_HEIGHT + 36}
              />
            ) : (
              <Empty description='No analytics data' />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={
              <div className='flex items-center justify-between w-full'>
                <span className='pr-2 truncate'>
                  {selectedRadarParent
                    ? `Danh mục: ${selectedRadarParent}`
                    : 'Danh mục bán chạy'}
                </span>
                {selectedRadarParent && (
                  <Button
                    size='small'
                    type='link'
                    onClick={() => setSelectedRadarParent(null)}
                    className='px-0'
                  >
                    Quay lại
                  </Button>
                )}
              </div>
            }
            className='h-full rounded-xl border-slate-200'
          >
            {categoryRadarData.length ? (
              <CategoryRadarChart
                data={categoryRadarData}
                height={CHART_HEIGHT + 36}
                onCategoryClick={
                  !selectedRadarParent ? setSelectedRadarParent : undefined
                }
              />
            ) : (
              <Empty description='Chưa có dữ liệu danh mục' />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title='Sản phẩm bán chạy nhất'
            className='h-full rounded-xl border-slate-200'
          >
            {mostSoldProducts.length ? (
              <Table
                rowKey='id'
                dataSource={mostSoldProducts}
                pagination={false}
                size='small'
                columns={mostSoldColumns}
                bordered
              />
            ) : (
              <Empty description='Chưa có dữ liệu sản phẩm' />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title='Tổng quan đơn hàng'
            className='h-full rounded-xl border-slate-200'
          >
            <OrdersTable data={orderOverviewData} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
