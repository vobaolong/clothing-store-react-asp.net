import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { getAdminProducts, getAdminDeletedProducts } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'

export function useAdminProducts(listMode: 'active' | 'deleted') {
  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.adminProducts,
    queryFn: getAdminProducts,
    enabled: listMode === 'active'
  })
  const deletedProductsQuery = useQuery({
    queryKey: QUERY_KEYS.adminProductsDeleted,
    queryFn: getAdminDeletedProducts,
    enabled: listMode === 'deleted'
  })

  const [filters, setFilters] = useState({
    search: '',
    categoryId: ADMIN_FILTER_ALL_VALUE,
    active: ADMIN_FILTER_ALL_VALUE,
    dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
  })

  const data =
    listMode === 'active' ? productsQuery.data : deletedProductsQuery.data
  const loading =
    listMode === 'active'
      ? productsQuery.isLoading
      : deletedProductsQuery.isLoading
  const refreshQuery =
    listMode === 'active' ? productsQuery : deletedProductsQuery

  const filteredData = useMemo(() => {
    const list = data ?? []
    const needle = adminSearchNeedle(filters.search)
    const startOfDay = filters.dateRange?.[0]?.startOf('day')
    const endOfDay = filters.dateRange?.[1]?.endOf('day')

    return list.filter((product) => {
      const searchMatch =
        !needle ||
        adminRowMatches(
          needle,
          product.name,
          product.productCode,
          product.slug,
          product.categoryName,
          product.id,
          product.categoryId
        )
      const categoryMatch =
        filters.categoryId === ADMIN_FILTER_ALL_VALUE ||
        product.categoryId === filters.categoryId
      const activeMatch =
        filters.active === ADMIN_FILTER_ALL_VALUE
          ? true
          : filters.active === 'active'
            ? product.isActive
            : !product.isActive
      const createdAt = dayjs(product.createdAt)
      const dateMatch =
        (!startOfDay ||
          createdAt.isAfter(startOfDay) ||
          createdAt.isSame(startOfDay)) &&
        (!endOfDay ||
          createdAt.isBefore(endOfDay) ||
          createdAt.isSame(endOfDay))
      return searchMatch && categoryMatch && activeMatch && dateMatch
    })
  }, [data, filters])

  return {
    productsQuery,
    deletedProductsQuery,
    data,
    loading,
    refreshQuery,
    filters,
    setFilters,
    filteredData
  }
}
