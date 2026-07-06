import { Card, Statistic, Skeleton } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getAdminRevenueKpi } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { formatCurrency } from '@/utils/format'
import { useTranslation } from 'react-i18next'

export default function RevenueKpiCard() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.adminRevenueKpi,
    queryFn: getAdminRevenueKpi
  })

  if (isLoading) return <Skeleton active />

  if (isError || !data) {
    return <Card title={t('admin.revenue')}>{t('common.error')}</Card>
  }

  const { currentRevenue, difference, percentageChange } = data

  const isPositive = difference > 0
  const isNegative = difference < 0

  return (
    <Card title={t('admin.revenue')} className="rounded-xl border-slate-200">
      <div className="flex items-center justify-between">
        <Statistic
          title={t('admin.currentRevenue')}
          value={formatCurrency(currentRevenue)}
        />

        <div className="text-right">
          <div className="mb-2">
            <Statistic
              title={t('admin.difference')}
              value={formatCurrency(difference)}
              valueStyle={{
                color: isPositive
                  ? '#16a34a'
                  : isNegative
                    ? '#dc2626'
                    : undefined
              }}
              prefix={
                isPositive ? (
                  <ArrowUpOutlined />
                ) : isNegative ? (
                  <ArrowDownOutlined />
                ) : undefined
              }
            />
          </div>
          <div>
            <Statistic
              title={t('admin.percentageChange')}
              value={
                percentageChange == null
                  ? t('admin.new')
                  : `${percentageChange.toFixed(2)}%`
              }
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
