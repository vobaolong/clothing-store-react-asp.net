import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { RevenueLineChartPoint } from '@/types/chart-types'

const formatTooltipValue = (value: unknown): [string, string] => {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
  return [numericValue.toLocaleString('vi-VN'), 'Doanh thu']
}

type RevenueLineChartProps = {
  data: RevenueLineChartPoint[]
  height?: number
  strokeColor?: string
  valueFormatter?: (value: number) => string
}

const DEFAULT_STROKE_COLOR = '#4f46e5'

export default function RevenueLineChart({
  data,
  height = 300,
  strokeColor = DEFAULT_STROKE_COLOR,
  valueFormatter
}: RevenueLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} />
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
            const numericValue =
              typeof value === 'number' ? value : Number(value ?? 0)
            return [
              valueFormatter
                ? valueFormatter(numericValue)
                : formatTooltipValue(numericValue)[0],
              'Doanh thu'
            ] as [string, string]
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={strokeColor}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
