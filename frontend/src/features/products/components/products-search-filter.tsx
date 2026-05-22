import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Select } from 'antd'
import { useRef } from 'react'

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

  const handleSubmitSearch = () => {
    onChange(draftKeywordRef.current)
  }

  return (
    <div className='p-4 space-y-3 bg-white border rounded-xl border-slate-200'>
      <div className='flex gap-2'>
        <Input
          key={value}
          allowClear
          size='large'
          defaultValue={value}
          onChange={(event) => {
            draftKeywordRef.current = event.target.value
          }}
          onPressEnter={handleSubmitSearch}
          placeholder='Tìm kiếm sản phẩm'
          suffix={<SearchOutlined className='text-slate-400' />}
        />
        <Button type='primary' size='large' onClick={handleSubmitSearch}>
          Tìm kiếm
        </Button>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
        <p className='text-base text-slate-900 font-semibold'>
          <span className='text-xl font-bold'>
            {value && `Kết quả tìm kiếm cho từ khóa "${value}"`}
          </span>{' '}
          Có {total} mặt hàng
        </p>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='text-sm font-medium text-slate-700'>
            Sắp xếp theo:
          </span>
          <Select
            size='medium'
            value={sortBy}
            onChange={onSortChange}
            className='w-40'
            options={[
              { label: 'Mới nhất', value: 'newest' },
              { label: 'Bán chạy', value: 'best-selling' },
              { label: 'Giá thấp đến cao', value: 'price-asc' },
              { label: 'Giá cao đến thấp', value: 'price-desc' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
