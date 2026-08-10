import { useTranslation } from 'react-i18next'
import { Checkbox, Collapse, ConfigProvider } from 'antd'
import type { CollapseProps } from 'antd'
import { UpOutlined } from '@ant-design/icons'

import { COLOR_CONFIG } from '@/constants/product.constant'

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

function CollapseHeader({ children }: { children: string }) {
	return (
		<span className="font-bold text-stone-500 uppercase text-[11px] tracking-wider">
			{children}
		</span>
	)
}

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
	const { t } = useTranslation()
	const isPriceSelected = ([lo, hi]: number[]) =>
		lo === priceRange[0] && hi === priceRange[1]

	const collapseItems: CollapseProps['items'] = [
		{
			key: 'category',
			label: <CollapseHeader>{t('productFilter.category')}</CollapseHeader>,
			children: (
				<div className="overflow-y-auto max-h-125">
					<Checkbox.Group
						value={selectedCategories}
						onChange={(values) => onCategoryChange(values as string[])}
						className="flex flex-col w-full gap-3"
					>
						{categoryOptions.map((option) => (
							<Checkbox
								key={`category-${option.value}`}
								value={option.value}
								className="w-full text-[14px] font-medium text-stone-700"
								style={{ paddingLeft: (option.depth ?? 0) * 18 }}
							>
								{option.label}
							</Checkbox>
						))}
					</Checkbox.Group>
				</div>
			)
		},
		{
			key: 'size',
			label: <CollapseHeader>{t('productFilter.size')}</CollapseHeader>,
			children: (
				<div className="grid grid-cols-4 gap-2">
					{sizeOptions.map((size) => {
						const isSelected = selectedSizes.includes(size)
						return (
							<button
								key={size}
								type="button"
								onClick={() => {
									onSizeChange(
										isSelected
											? selectedSizes.filter((s) => s !== size)
											: [...selectedSizes, size]
									)
								}}
								className={`h-10 cursor-pointer rounded-lg border text-sm font-medium transition-all ${isSelected
									? 'border-black bg-black/50 text-white hover:bg-black/30 dark:text-black! dark:bg-white dark:hover:bg-white/80'
									: 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-500'
									}`}
							>
								{size}
							</button>
						)
					})}
				</div>
			)
		},
		{
			key: 'color',
			label: <CollapseHeader>{t('productFilter.color')}</CollapseHeader>,
			children: (
				<div className="grid grid-cols-4 gap-x-2 gap-y-4">
					{colorOptions.map(({ label, hex }) => {
						const config = COLOR_CONFIG[label] || { color: hex }
						const isSelected = selectedColors.includes(label)
						return (
							<button
								key={label}
								type="button"
								onClick={() => {
									onColorChange(
										isSelected
											? selectedColors.filter((v) => v !== label)
											: [...selectedColors, label]
									)
								}}
								className="flex flex-col items-center cursor-pointer gap-1 group"
							>
								<div
									className={`relative h-9 w-9 rounded-full transition-transform group-hover:scale-105 ${isSelected
										? 'ring-1 ring-black ring-offset-2'
										: 'border-stone-300 border'
										} ${config.border ? 'border border-stone-200' : ''}`}
									style={{ background: config.color }}
								>
									{isSelected && (
										<div className="absolute inset-0 flex items-center justify-center">
											<div
												className={`h-1.5 w-1.5 rounded-full ${label === 'Trắng' ? 'bg-black' : 'bg-white'}`}
											/>
										</div>
									)}
								</div>
								<span className="text-center text-[10px] leading-tight text-stone-500 transition-colors group-hover:text-black dark:text-stone-300 dark:group-hover:text-white!">
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
			label: <CollapseHeader>{t('productFilter.price')}</CollapseHeader>,
			children: (
				<div className="flex flex-col gap-3">
					{PRICE_RANGES.map((range) => (
						<Checkbox
							key={range.label}
							checked={isPriceSelected(range.value)}
							onChange={() =>
								onPriceRangeChange(range.value as [number, number])
							}
							className="text-[14px] font-medium text-stone-700"
						>
							{range.label}
						</Checkbox>
					))}
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
			<aside className="w-full">
				<div className="flex items-center justify-between py-4 border-b border-stone-200">
					<h2 className="text-lg font-bold">{t('productFilter.title')}</h2>
					<span className="text-sm font-medium text-stone-400">
						{t('productFilter.resultCount', { count: totalResults })}
					</span>
				</div>

				<Collapse
					ghost
					defaultActiveKey={['category', 'size', 'color', 'price']}
					expandIconPlacement="end"
					expandIcon={({ isActive }) => (
						<UpOutlined
							rotate={isActive ? 0 : 180}
							className="text-[10px] text-stone-400"
						/>
					)}
					className="products-filter-collapse"
					items={collapseItems}
				/>
			</aside>
		</ConfigProvider>
	)
}
