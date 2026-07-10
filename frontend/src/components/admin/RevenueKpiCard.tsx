import { useState } from 'react'
import { Card, Statistic, Skeleton, Select, Space } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getAdminRevenueKpi } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { formatCurrency } from '@/utils/format'
import { useTranslation } from 'react-i18next'
import type { RevenueKpiFilter } from '@/types'

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: currentYear - i,
  label: String(currentYear - i)
}))

const QUARTER_OPTIONS = [
  { value: 1, label: 'Q1' },
  { value: 2, label: 'Q2' },
  { value: 3, label: 'Q3' },
  { value: 4, label: 'Q4' }
]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1)
}))

export default function RevenueKpiCard() {
  const { t } = useTranslation()
  const [periodType, setPeriodType] = useState<RevenueKpiFilter['periodType']>()
  const [periodValue, setPeriodValue] = useState<number>()
  const [year, setYear] = useState<number>()

  const filter: RevenueKpiFilter =
    periodType && periodValue ? { periodType, periodValue, year } : {}

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.adminRevenueKpi(filter),
    queryFn: () => getAdminRevenueKpi(filter)
  })

  const handlePeriodTypeChange = (value: RevenueKpiFilter['periodType']) => {
    setPeriodType(value)
    setPeriodValue(undefined)
  }

  if (isLoading) return <Skeleton active />

  if (isError || !data) {
    return <Card title={t('admin.revenue')}>{t('common.error')}</Card>
  }

  const { currentRevenue, difference, percentageChange } = data

  const isPositive = difference > 0
  const isNegative = difference < 0

  return (
    <Card
      title={t('admin.revenue')}
      className="rounded-xl border-slate-200"
      extra={
        <Space size="small" wrap>
          <Select
            allowClear
            placeholder={t('admin.periodType')}
            value={periodType}
            onChange={handlePeriodTypeChange}
            className="min-w-25!"
            options={[
              { value: 'month', label: t('admin.periodMonth') },
              { value: 'quarter', label: t('admin.periodQuarter') }
            ]}
          />
          {periodType && (
            <Select
              allowClear
              placeholder={t('admin.periodValue')}
              value={periodValue}
              onChange={setPeriodValue}
              className="min-w-20!"
              options={
                periodType === 'quarter' ? QUARTER_OPTIONS : MONTH_OPTIONS
              }
            />
          )}
          <Select
            allowClear
            placeholder={String(currentYear)}
            value={year}
            onChange={setYear}
            className="min-w-22!"
            options={yearOptions}
          />
        </Space>
      }
    >
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
              styles={{
                content: {
                  color: isPositive
                    ? '#16a34a'
                    : isNegative
                      ? '#dc2626'
                      : undefined
                }
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
