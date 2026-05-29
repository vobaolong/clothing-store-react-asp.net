import { useMemo } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import type { Customer, DateRangeType } from '@/types'

dayjs.extend(isBetween)

interface UseFilteredCustomersProps {
  data: Customer[] | undefined
  search: string
  dateRange: DateRangeType
}

export function useFilteredCustomers({
  data,
  search,
  dateRange
}: UseFilteredCustomersProps) {
  return useMemo(() => {
    const list = data ?? []
    const needle = search.trim().toLowerCase()
    const startOfDay = dateRange?.[0]?.startOf('day')
    const endOfDay = dateRange?.[1]?.endOf('day')

    return list.filter((c) => {
      const searchMatch =
        !needle ||
        [c.id, c.name, c.phone, c.email]
          .join(' ')
          .toLowerCase()
          .includes(needle)

      const createdAt = dayjs(c.createdAt)
      const dateMatch =
        !startOfDay ||
        !endOfDay ||
        createdAt.isBetween(startOfDay, endOfDay, 'day', '[]')

      return searchMatch && dateMatch
    })
  }, [data, search, dateRange])
}
