import { useState, useMemo } from 'react'
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

import {
  getAdminCategories,
  getAdminOrders,
  getAdminProducts
} from '@/api/admin-api'
import { getAdminCoupons } from '@/api/coupons-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { AdminNavKey } from '@/enums'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import type { Coupon } from '@/types'
import AnalyticsAreaChart from '@/components/admin/AnalyticsAreaChart'
import CategoryRadarChart from '@/components/admin/CategoryRadarChart'
import { useAdmin } from '@/context/admin/AdminContext'
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics'
import OrdersTable from '../admin-table/OrdersTable'

const CHART_HEIGHT = 280
type RevenueGranularity = 'day' | 'week' | 'month' | 'year'

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

  const {
    stats,
    analyticsData,
    categoryRadarData,
    orderOverviewData,
    mostSoldProducts
  } = useDashboardAnalytics({
    products,
    categories,
    orders,
    coupons,
    granularity,
    selectedRadarParent
  })

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
      <Alert type="error" title="Không thể tải dữ liệu dashboard" showIcon />
    )
  }

  return (
    <div className="space-y-6!">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          hoverable
          className="rounded-xl shadow-sm transition-shadow cursor-pointer border-slate-200 hover:shadow-md"
          onClick={() => navigate(`/admin/${AdminNavKey.PRODUCTS}`)}
        >
          <Statistic
            title="Sản phẩm"
            value={stats.products}
            prefix={<AppstoreOutlined className="text-indigo-500!" />}
          />
        </Card>
        <Card
          hoverable
          className="rounded-xl shadow-sm transition-shadow cursor-pointer border-slate-200 hover:shadow-md"
          onClick={() => navigate(`/admin/${AdminNavKey.CATEGORIES}`)}
        >
          <Statistic
            title="Danh mục"
            value={stats.categories}
            prefix={<FolderOutlined className="text-teal-500!" />}
          />
        </Card>
        <Card
          hoverable
          className="rounded-xl shadow-sm transition-shadow cursor-pointer border-slate-200 hover:shadow-md"
          onClick={() => navigate(`/admin/${AdminNavKey.ORDERS}`)}
        >
          <Statistic
            title="Đơn hàng"
            value={stats.orders}
            prefix={<TagsOutlined className="text-amber-500!" />}
          />
        </Card>
        <Card
          hoverable
          className="rounded-xl shadow-sm transition-shadow cursor-pointer border-slate-200 hover:shadow-md"
          onClick={() => navigate(`/admin/${AdminNavKey.COUPONS}`)}
        >
          <Statistic
            title="Voucher"
            value={stats.coupons}
            prefix={<TagsOutlined className="text-violet-500!" />}
          />
        </Card>
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
