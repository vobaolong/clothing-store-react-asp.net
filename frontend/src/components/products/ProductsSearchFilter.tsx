import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Select } from 'antd'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

type ProductsSearchFilterProps = {
  value: string
  total: number
  sortBy: string
  onChange: (value: string) => void
  onSortChange: (value: string) => void
}

export default function ProductsSearchFilter({
  value,
  total,
  sortBy,
  onChange,
  onSortChange
}: ProductsSearchFilterProps) {
  const draftKeywordRef = useRef(value)
  const { t } = useTranslation()
  const handleSubmitSearch = () => {
    onChange(draftKeywordRef.current)
  }

  return (
    <div className="p-4 border space-y-3 rounded-xl border-slate-200 dark:border-gray-700">
      <div className="flex gap-2">
        <Input
          key={value}
          allowClear
          size="large"
          defaultValue={value}
          onChange={(event) => {
            draftKeywordRef.current = event.target.value
          }}
          onPressEnter={handleSubmitSearch}
          placeholder={t('productFilter.searchPlaceholder')}
          suffix={<SearchOutlined className="text-slate-400" />}
        />
        <Button type="primary" size="large" onClick={handleSubmitSearch}>
          {t('common.search')}
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between pt-1 gap-3">
        <p className="text-base font-semibold">
          <span className="text-xl font-bold">
            {value && t('productFilter.resultCountFor', { keyword: value })}
          </span>{' '}
          {t('product.totalProducts', { total: total })}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">
            {t('productFilter.sortBy')}
          </span>
          <Select
            size="medium"
            value={sortBy}
            onChange={onSortChange}
            className="w-40"
            options={[
              { label: t('productFilter.newest'), value: 'newest' },
              { label: t('productFilter.bestSelling'), value: 'best-selling' },
              { label: t('productFilter.priceAsc'), value: 'price-asc' },
              { label: t('productFilter.priceDesc'), value: 'price-desc' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
