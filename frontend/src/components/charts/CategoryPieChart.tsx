import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import type { ChartDataPoint } from '@/types/chart-types'

const formatTooltipValue = (value: unknown): [string, string] => {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
  return [numericValue.toLocaleString('vi-VN'), 'Tổng']
}

type CategoryPieChartProps = {
  data: ChartDataPoint[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  colors?: string[]
  valueFormatter?: (value: number) => string
}

const DEFAULT_COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#06b6d4']

export default function CategoryPieChart({
  data,
  height = 300,
  innerRadius = 56,
  outerRadius = 92,
  colors = DEFAULT_COLORS,
  valueFormatter
}: CategoryPieChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip
          formatter={(value) => {
            const numericValue =
              typeof value === 'number' ? value : Number(value ?? 0)
            return [
              valueFormatter
                ? valueFormatter(numericValue)
                : formatTooltipValue(numericValue)[0],
              'Tổng'
            ] as [string, string]
          }}
        />
        {totalValue > 0 ? (
          <>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              label={(labelProps: { name?: string; percent?: number }) => {
                const { name, percent } = labelProps as {
                  name?: string
                  percent?: number
                }
                return `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
              }}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Legend />
          </>
        ) : (
          <Pie
            data={[{ name: 'No data', value: 1 }]}
            dataKey="value"
            nameKey="name"
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
