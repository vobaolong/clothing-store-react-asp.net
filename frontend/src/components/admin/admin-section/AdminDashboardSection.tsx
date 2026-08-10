import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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

import {
  getAdminCategories,
  getAdminOrders,
  getAdminProducts
} from '@/api/admin-api'
import { getAdminCoupons } from '@/api/coupons-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { AdminNavKey } from '@/enums'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import type { Coupon } from '@/types'
import AnalyticsAreaChart from '@/components/admin/AnalyticsAreaChart'
import CategoryRadarChart from '@/components/admin/CategoryRadarChart'
import { useAdmin } from '@/context/AdminContext'
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics'
import OrdersTable from '../admin-table/OrdersTable'
import { ArrowUpRight, FolderTree, Package, Shirt, Ticket } from 'lucide-react'
import { lp } from '@/utils/language-path'
import { useTranslation } from 'react-i18next'
import RevenueKpiCard from '@/components/admin/RevenueKpiCard'

const CHART_HEIGHT = 280
type RevenueGranularity = 'day' | 'week' | 'month' | 'year'
const STAT_CARD_ITEMS = [
  {
    navKey: AdminNavKey.PRODUCTS,
    titleKey: 'admin.products',
    statKey: 'products',
    icon: <Shirt className="text-indigo-500!" />
  },
  {
    navKey: AdminNavKey.CATEGORIES,
    titleKey: 'admin.categories',
    statKey: 'categories',
    icon: <FolderTree className="text-teal-500!" />
  },
  {
    navKey: AdminNavKey.ORDERS,
    titleKey: 'admin.orders',
    statKey: 'orders',
    icon: <Package className="text-amber-500!" />
  },
  {
    navKey: AdminNavKey.COUPONS,
    titleKey: 'admin.coupons',
    statKey: 'coupons',
    icon: <Ticket className="text-violet-500!" />
  }
] as const

export default function AdminDashboardSection() {
  const { t } = useTranslation()
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
    queryKey: QUERY_KEYS.adminOrders(ADMIN_FILTER_ALL_VALUE),
    queryFn: () => getAdminOrders(ADMIN_FILTER_ALL_VALUE)
  })
  const couponsQuery = useQuery<Coupon[]>({
    queryKey: QUERY_KEYS.adminCoupons,
    queryFn: () => getAdminCoupons()
  })

  const loading = [
    productsQuery,
    categoriesQuery,
    ordersQuery,
    couponsQuery
  ].some((q) => q.isLoading)
  const hasError = [
    productsQuery,
    categoriesQuery,
    ordersQuery,
    couponsQuery
  ].some((q) => q.isError)

  const {
    stats,
    analyticsData,
    categoryRadarData,
    orderOverviewData,
    mostSoldProducts
  } = useDashboardAnalytics({
    products: productsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    orders: ordersQuery.data?.orders ?? [],
    coupons: couponsQuery.data ?? [],
    granularity,
    selectedRadarParent
  })
  const mostSoldColumns = [
    {
      title: '#',
      key: 'stt',
      width: 60,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => index + 1
    },
    { title: t('product.productName'), dataIndex: 'name', key: 'name' },
    {
      title: t('product.soldCount'),
      dataIndex: 'soldCount',
      className: 'truncate',
      key: 'soldCount',
      align: 'right' as const
    }
  ]

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />

  if (hasError) {
    return <Alert type="error" title={t('admin.dashboardLoadError')} showIcon />
  }

  return (
    <div className="space-y-6!">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARD_ITEMS.map((card) => (
          <Card key={card.navKey}>
            <div className="flex justify-between">
              <Statistic
                title={t(card.titleKey)}
                value={stats[card.statKey]}
                prefix={card.icon}
              />
              <Button
                className="shrink-0 p-0! text-slate-800!"
                icon={<ArrowUpRight className="text-slate-600!" />}
                onClick={() => navigate(lp(`/admin/${card.navKey}`))}
              />
            </div>
          </Card>
        ))}
      </div>

      <div>
        <RevenueKpiCard />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={t('admin.totalRevenue')}
            className="h-full rounded-xl border-slate-200"
            extra={
              <Segmented<RevenueGranularity>
                value={granularity}
                onChange={setGranularity}
                options={[
                  { label: t('common.day'), value: 'day' },
                  { label: t('common.week'), value: 'week' },
                  { label: t('common.month'), value: 'month' },
                  { label: t('common.year'), value: 'year' }
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
              <Empty description={t('admin.noAnalyticsData')} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span className="pr-2 truncate">
                  {selectedRadarParent
                    ? `${t('admin.categories')}: ${selectedRadarParent}`
                    : `${t('admin.topCategories')}`}
                </span>
                {selectedRadarParent && (
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setSelectedRadarParent(null)}
                    className="px-0"
                  >
                    {t('common.goBack')}
                  </Button>
                )}
              </div>
            }
            className="h-full rounded-xl border-slate-200"
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
              <Empty description={t('admin.noCategoryData')} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title={t('admin.mostSoldProducts')}
            className="h-full rounded-xl border-slate-200"
          >
            {mostSoldProducts.length ? (
              <Table
                rowKey="id"
                dataSource={mostSoldProducts}
                pagination={false}
                size="small"
                columns={mostSoldColumns}
                bordered
              />
            ) : (
              <Empty description={t('admin.noProductData')} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title={t('admin.orderOverview')}
            className="h-full rounded-xl border-slate-200"
          >
            <OrdersTable data={orderOverviewData} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
