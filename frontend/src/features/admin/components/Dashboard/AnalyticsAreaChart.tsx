import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { AnalyticsPoint } from '@/types'
import { formatCurrency } from '@/utils/format'

type AnalyticsAreaChartProps = {
  data: AnalyticsPoint[]
  height?: number
}

export default function AnalyticsAreaChart({
  data,
  height = 320
}: AnalyticsAreaChartProps) {
  return (
    <ResponsiveContainer width='100%' height={height}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 8, left: 40 }}
      >
        <defs>
          <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
            <stop offset='95%' stopColor='#10b981' stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke='#e2e8f0' strokeDasharray='3 3' />
        <XAxis dataKey='date' tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis
          allowDecimals={false}
          width={10}
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(val) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
            return val
          }}
        />
        <Tooltip formatter={(val) => formatCurrency(Number(val ?? 0))} />
        <Area
          type='monotone'
          dataKey='revenue'
          name='Doanh thu'
          stroke='#10b981'
          fill='url(#revenueGradient)'
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
