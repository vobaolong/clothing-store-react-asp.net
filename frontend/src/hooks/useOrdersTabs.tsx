import { useMemo } from 'react'
import { Badge } from 'antd'
import {
  ADMIN_FILTER_ALL_VALUE,
  ADMIN_ORDER_STATUS_FILTER_OPTIONS
} from '@/constants/admin-filter.constant'

interface CountItem {
  status: string
  count: number
}

export function useOrdersTabs(counts: CountItem[] | undefined) {
  return useMemo(() => {
    const list = counts ?? []
    return [
      {
        key: ADMIN_FILTER_ALL_VALUE,
        label: (
          <Badge count={list.reduce((acc, curr) => acc + curr.count, 0)}>
            <span className="pr-5">Tất cả</span>
          </Badge>
        )
      },
      ...ADMIN_ORDER_STATUS_FILTER_OPTIONS.filter(
        (opt) => opt.value !== ADMIN_FILTER_ALL_VALUE
      ).map((opt) => ({
        key: opt.value,
        label: (
          <Badge count={list.find((c) => c.status === opt.value)?.count || 0}>
            <span className="pr-5">{opt.label}</span>
          </Badge>
        )
      }))
    ]
  }, [counts])
}
