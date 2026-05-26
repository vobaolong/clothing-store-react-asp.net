import { Checkbox, Collapse, ConfigProvider } from 'antd'
import type { CollapseProps } from 'antd'
import { UpOutlined } from '@ant-design/icons'

import { COLOR_CONFIG } from '@/constants/product'

type Option = {
  label: string
  value: string
  depth?: number
}

interface ProductsFilterProps {
  selectedCategories: string[]
  categoryOptions: Option[]
  selectedSizes: string[]
  sizeOptions: string[]
  selectedColors: string[]
  colorOptions: Array<{ label: string; hex: string }>
  priceRange: [number, number]
  onCategoryChange: (value: string[]) => void
  onSizeChange: (value: string[]) => void
  onColorChange: (value: string[]) => void
  onPriceRangeChange: (value: [number, number]) => void
  totalResults?: number
}

const PRICE_RANGES = [
  { label: '0 - 200.000đ', value: [0, 200000] },
  { label: '200.000đ - 300.000đ', value: [200000, 300000] },
  { label: '300.000đ - 500.000đ', value: [300000, 500000] },
  { label: '> 500.000đ', value: [500000, 10000000] }
]

export default function ProductsFilter({
  selectedCategories,
  categoryOptions,
  selectedSizes,
  sizeOptions,
  selectedColors,
  colorOptions,
  priceRange,
  onCategoryChange,
  onSizeChange,
  onColorChange,
  onPriceRangeChange,
  totalResults = 0
}: ProductsFilterProps) {
  const collapseItems: CollapseProps['items'] = [
    {
      key: 'category',
      label: (
        <span className='font-bold text-stone-500 uppercase text-[11px] tracking-wider'>
          Danh mục
        </span>
      ),
      children: (
        <Checkbox.Group
          value={selectedCategories}
          onChange={(values) => onCategoryChange(values as string[])}
          className='flex flex-col gap-3 w-full'
        >
          {categoryOptions.map((option) => (
            <Checkbox
              key={`category-${option.value}`}
              value={option.value}
              className='w-full text-[14px] font-medium text-stone-700'
              style={{
                paddingLeft: (option.depth ?? 0) * 18
              }}
            >
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      )
    },
    {
      key: 'size',
      label: (
        <span className='font-bold text-stone-500 uppercase text-[11px] tracking-wider'>
          Kích thước
        </span>
      ),
      children: (
        <div className='grid grid-cols-4 gap-2'>
          {sizeOptions.map((size) => (
            <button
              key={size}
              type='button'
              onClick={() => {
                const next = selectedSizes.includes(size)
                  ? selectedSizes.filter((s) => s !== size)
                  : [...selectedSizes, size]
                onSizeChange(next)
              }}
              className={`h-10 cursor-pointer rounded-lg border text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? 'border-black bg-black text-white!'
                  : 'border-stone-200 bg-white! text-stone-600 hover:border-stone-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )
    },
    {
      key: 'color',
      label: (
        <span className='font-bold text-stone-500 uppercase text-[11px] tracking-wider'>
          Màu sắc
        </span>
      ),
      children: (
        <div className='grid grid-cols-4 gap-x-2 gap-y-4'>
          {colorOptions.map(({ label, hex }) => {
            const config = COLOR_CONFIG[label] || { color: hex }
            return (
              <button
                key={label}
                type='button'
                onClick={() => {
                  const next = selectedColors.includes(label)
                    ? selectedColors.filter((v) => v !== label)
                    : [...selectedColors, label]
                  onColorChange(next)
                }}
                className='flex flex-col gap-1 items-center cursor-pointer group'
              >
                <div
                  className={`relative h-9 w-9 rounded-full transition-transform group-hover:scale-105 ${
                    selectedColors.includes(label)
                      ? 'ring-2 ring-black ring-offset-2'
                      : ''
                  } ${config.border ? 'border border-stone-200' : ''}`}
                  style={{ background: config.color }}
                >
                  {selectedColors.includes(label) && (
                    <div className='flex absolute inset-0 justify-center items-center'>
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${label === 'Trắng' ? 'bg-black' : 'bg-white'}`}
                      />
                    </div>
                  )}
                </div>
                <span className='text-center text-[10px] leading-tight text-stone-500 transition-colors group-hover:text-black'>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      )
    },
    {
      key: 'price',
      label: (
        <span className='font-bold text-stone-500 uppercase text-[11px] tracking-wider'>
          Giá
        </span>
      ),
      children: (
        <div className='space-y-3'>
          <Checkbox.Group
            value={PRICE_RANGES.filter(
              (r) =>
                r.value[0] === priceRange[0] && r.value[1] === priceRange[1]
            ).map((r) => r.label)}
            className='flex flex-col gap-3 w-full'
          >
            {PRICE_RANGES.map((range) => (
              <Checkbox
                key={range.label}
                value={range.label}
                className='text-[14px] font-medium text-stone-700'
                onChange={(e) => {
                  if (e.target.checked) {
                    onPriceRangeChange(range.value as [number, number])
                  }
                }}
              >
                {range.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      )
    }
  ]

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
          borderRadius: 4
        },
        components: {
          Collapse: {
            headerPadding: '12px 0',
            contentPadding: '0 0 16px 0',
            headerBg: 'transparent'
          },
          Checkbox: {
            borderRadius: 10
          }
        }
      }}
    >
      <aside className='w-full'>
        <div className='flex justify-between items-center py-4 border-b border-stone-200'>
          <h2 className='text-lg font-bold text-black'>Bộ lọc</h2>
          <span className='text-sm font-medium text-stone-400'>
            {totalResults} kết quả
          </span>
        </div>

        <Collapse
          ghost
          defaultActiveKey={['category', 'size', 'color', 'price']}
          expandIconPlacement='end'
          expandIcon={({ isActive }) => (
            <UpOutlined
              rotate={isActive ? 0 : 180}
              className='text-[10px] text-stone-400'
            />
          )}
          className='products-filter-collapse'
          items={collapseItems}
        />
      </aside>
    </ConfigProvider>
  )
}
