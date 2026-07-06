import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { OrderBarChartPoint } from '@/types/chart-types'
import i18n from 'i18next'

const formatTooltipValue = (value: unknown): [string, string] => {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
  return [numericValue.toLocaleString('vi-VN'), i18n.t('common.quantity')]
}

type OrderBarChartProps = {
  data: OrderBarChartPoint[]
  height?: number
  barColor?: string
  valueFormatter?: (value: number) => string
}

const DEFAULT_BAR_COLOR = '#14b8a6'

export default function OrderBarChart({
  data,
  height = 300,
  barColor = DEFAULT_BAR_COLOR,
  valueFormatter
}: OrderBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          formatter={(value) => {
            const numericValue =
              typeof value === 'number' ? value : Number(value ?? 0)
            return [
              valueFormatter
                ? valueFormatter(numericValue)
                : formatTooltipValue(numericValue)[0],
              i18n.t('common.quantity')
            ] as [string, string]
          }}
        />
        <Bar dataKey="count" fill={barColor} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
