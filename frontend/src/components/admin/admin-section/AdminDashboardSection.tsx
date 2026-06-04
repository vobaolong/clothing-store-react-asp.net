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

const CHART_HEIGHT = 280
type RevenueGranularity = 'day' | 'week' | 'month' | 'year'

interface StatCard {
  navKey: AdminNavKey
  title: string
  statKey: 'products' | 'categories' | 'orders' | 'coupons'
  icon: React.ReactNode
}

const STAT_CARDS: StatCard[] = [
  {
    navKey: AdminNavKey.PRODUCTS,
    title: 'Sản phẩm',
    statKey: 'products',
    icon: <Shirt className="text-indigo-500!" />
  },
  {
    navKey: AdminNavKey.CATEGORIES,
    title: 'Danh mục',
    statKey: 'categories',
    icon: <FolderTree className="text-teal-500!" />
  },
  {
    navKey: AdminNavKey.ORDERS,
    title: 'Đơn hàng',
    statKey: 'orders',
    icon: <Package className="text-amber-500!" />
  },
  {
    navKey: AdminNavKey.COUPONS,
    title: 'Voucher',
    statKey: 'coupons',
    icon: <Ticket className="text-violet-500!" />
  }
]

const mostSoldColumns = [
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
]

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

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />

  if (hasError) {
    return (
      <Alert type="error" title="Không thể tải dữ liệu dashboard" showIcon />
    )
  }

  return (
    <div className="space-y-6!">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.navKey}>
            <div className="flex justify-between">
              <Statistic
                title={card.title}
                value={stats[card.statKey]}
                prefix={card.icon}
              />
              <Button
                className="shrink-0 p-0! text-slate-800!"
                icon={<ArrowUpRight className="text-slate-600!" />}
                onClick={() => navigate(`/admin/${card.navKey}`)}
              />
            </div>
          </Card>
        ))}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Tổng doanh thu"
            className="h-full rounded-xl border-slate-200"
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
              <Empty description="No analytics data" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="pr-2 truncate">
                  {selectedRadarParent
                    ? `Danh mục: ${selectedRadarParent}`
                    : 'Danh mục bán chạy'}
                </span>
                {selectedRadarParent && (
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setSelectedRadarParent(null)}
                    className="px-0"
                  >
                    Quay lại
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
              <Empty description="Chưa có dữ liệu danh mục" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title="Sản phẩm bán chạy nhất"
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
              <Empty description="Chưa có dữ liệu sản phẩm" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title="Tổng quan đơn hàng"
            className="h-full rounded-xl border-slate-200"
          >
            <OrdersTable data={orderOverviewData} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
