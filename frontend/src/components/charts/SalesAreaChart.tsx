import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RevenueLineChartPoint } from '@/components/charts/chart-types'

type SalesAreaChartProps = {
  data: RevenueLineChartPoint[]
  height?: number
  strokeColor?: string
  fillColor?: string
  valueFormatter?: (value: number) => string
}

const DEFAULT_STROKE_COLOR = '#4f46e5'
const DEFAULT_FILL_COLOR = '#818cf833'

export default function SalesAreaChart({
  data,
  height = 300,
  strokeColor = DEFAULT_STROKE_COLOR,
  fillColor = DEFAULT_FILL_COLOR,
  valueFormatter,
}: SalesAreaChartProps) {
  return (
    <ResponsiveContainer width='100%' height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke='#e2e8f0' strokeDasharray='3 3' />
        <XAxis dataKey='period' tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(value) =>
            value >= 1_000_000
              ? `${(value / 1_000_000).toFixed(1)}tr`
              : value.toLocaleString('vi-VN')
          }
        />
        <Tooltip
          formatter={(value) => {
            const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
            return [
              valueFormatter
                ? valueFormatter(numericValue)
                : numericValue.toLocaleString('vi-VN'),
              'Doanh thu',
            ] as [string, string]
          }}
        />
        <Area
          type='monotone'
          dataKey='revenue'
          stroke={strokeColor}
          fill={fillColor}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
