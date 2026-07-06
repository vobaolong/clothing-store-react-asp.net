import { useMemo } from 'react'
import { Badge } from 'antd'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { useAdminFilterOptions } from '@/options/admin-filter.options'
import { useTranslation } from 'react-i18next'

interface CountItem {
  status: string
  count: number
}

export function useOrdersTabs(counts: CountItem[] | undefined) {
  const { orderStatus } = useAdminFilterOptions()
  const { t } = useTranslation()
  return useMemo(() => {
    const list = counts ?? []
    return [
      {
        key: ADMIN_FILTER_ALL_VALUE,
        label: (
          <Badge count={list.reduce((acc, curr) => acc + curr.count, 0)}>
            <span className="pr-5">{t('common.all')}</span>
          </Badge>
        )
      },
      ...orderStatus
        .filter(
          (opt: { value: string }) => opt.value !== ADMIN_FILTER_ALL_VALUE
        )
        .map((opt: { value: string; label: string }) => ({
          key: opt.value,
          label: (
            <Badge count={list.find((c) => c.status === opt.value)?.count || 0}>
              <span className="pr-5">{opt.label}</span>
            </Badge>
          )
        }))
    ]
  }, [counts, orderStatus, t])
}
