import { Input, Select, TreeSelect, DatePicker } from 'antd'
import dayjs from 'dayjs'

type AdminListFilterSelect = {
  kind?: 'select'
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  className?: string
}

type AdminListFilterTree = {
  kind: 'tree'
  value?: string
  onChange: (value: string | undefined) => void
  treeData: Array<{
    title: string
    value: string
    children?: AdminListFilterTree['treeData']
  }>
  className?: string
  placeholder?: string
}

type AdminListFilterDateRange = {
  kind: 'date-range'
  value?: [dayjs.Dayjs | null, dayjs.Dayjs | null]
  onChange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void
  className?: string
  placeholder?: [string, string]
}

export type AdminListFilterControl =
  | AdminListFilterSelect
  | AdminListFilterTree
  | AdminListFilterDateRange

type AdminListFiltersProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchClassName?: string
  selects?: AdminListFilterControl[]
  className?: string
}

export default function AdminListFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchClassName = 'w-full sm:max-w-sm',
  selects = [],
  className = 'flex flex-wrap items-center w-full gap-2'
}: AdminListFiltersProps) {
  return (
    <div className={className}>
      <Input.Search
        allowClear
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className={searchClassName}
      />
      {selects.map((select, index) =>
        select.kind === 'date-range' ? (
          <DatePicker.RangePicker
            key={index}
            className={select.className}
            value={select.value}
            placeholder={select.placeholder}
            allowClear
            onChange={select.onChange}
          />
        ) : select.kind === 'tree' ? (
          <TreeSelect
            key={index}
            className={select.className}
            value={select.value}
            treeData={select.treeData}
            allowClear
            placeholder={select.placeholder ?? 'All'}
            showSearch={{ treeNodeFilterProp: 'title' }}
            treeDefaultExpandAll
            treeLine={{ showLeafIcon: false }}
            onChange={(value) => {
              select.onChange(typeof value === 'string' ? value : undefined)
            }}
          />
        ) : (
          <Select
            key={index}
            value={select.value}
            options={select.options}
            onChange={select.onChange}
            className={select.className}
          />
        )
      )}
    </div>
  )
}
