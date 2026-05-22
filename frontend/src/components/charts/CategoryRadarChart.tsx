import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { ChartDataPoint } from '@/components/charts/chart-types'

type CategoryRadarChartProps = {
  data: ChartDataPoint[]
  height?: number
  strokeColor?: string
  fillColor?: string
}

const DEFAULT_STROKE_COLOR = '#0ea5e9'
const DEFAULT_FILL_COLOR = '#0ea5e94d'

export default function CategoryRadarChart({
  data,
  height = 300,
  strokeColor = DEFAULT_STROKE_COLOR,
  fillColor = DEFAULT_FILL_COLOR,
}: CategoryRadarChartProps) {
  return (
    <ResponsiveContainer width='100%' height={height}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey='name' tick={{ fill: '#64748b', fontSize: 12 }} />
        <PolarRadiusAxis
          angle={30}
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={(value) => value.toLocaleString('vi-VN')}
        />
        <Tooltip
          formatter={(value) => {
            const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
            return [numericValue.toLocaleString('vi-VN'), 'Đã bán'] as [string, string]
          }}
        />
        <Radar
          dataKey='value'
          stroke={strokeColor}
          fill={fillColor}
          fillOpacity={0.8}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
