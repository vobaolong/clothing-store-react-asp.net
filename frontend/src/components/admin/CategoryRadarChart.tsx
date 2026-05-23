import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import type { CategoryRadarData } from '@/types'

type CategoryRadarChartProps = {
  data: CategoryRadarData[]
  height?: number
  onCategoryClick?: (categoryName: string) => void
}

type CustomTickProps = {
  payload: { value: string }
  x: number | string
  y: number | string
  textAnchor: string
}

export default function CategoryRadarChart({
  data,
  height = 300,
  onCategoryClick
}: CategoryRadarChartProps) {
  return (
    <ResponsiveContainer width='100%' height={height}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey='categoryName'
          tick={({ payload, x, y, textAnchor }: CustomTickProps) => {
            return (
              <text
                x={x}
                y={y}
                textAnchor={
                  textAnchor as 'start' | 'middle' | 'end' | 'inherit'
                }
                fill='#64748b'
                fontSize={12}
                className={
                  onCategoryClick
                    ? 'cursor-pointer hover:font-bold hover:fill-blue-600 transition-all'
                    : ''
                }
                onClick={() =>
                  onCategoryClick && onCategoryClick(payload.value)
                }
              >
                <tspan x={x} dy='0em'>
                  {payload.value}
                </tspan>
              </text>
            )
          }}
        />
        <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip
          formatter={(value) => {
            const numericValue =
              typeof value === 'number' ? value : Number(value ?? 0)
            return [numericValue.toLocaleString('vi-VN'), 'Sold'] as [
              string,
              string
            ]
          }}
        />
        <Radar
          name='Sold'
          dataKey='value'
          stroke='#0ea5e9'
          fill='#0ea5e94d'
          fillOpacity={0.8}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
