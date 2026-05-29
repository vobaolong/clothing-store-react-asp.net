import { useMemo } from 'react'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { adminRowMatches, adminSearchNeedle } from '@/utils/admin-list-filter'
import type { AdminCategory } from '@/types'
import type { AdminCategoryFilters } from '@/components/admin/admin-toolbar/AdminCategoriesToolbar'

interface UseFilteredCategoriesProps {
  data: AdminCategory[]
  filters: AdminCategoryFilters
}

export function useFilteredCategories({
  data,
  filters
}: UseFilteredCategoriesProps) {
  return useMemo(() => {
    const needle = adminSearchNeedle(filters.search)
    return data.filter((category) => {
      const searchMatch =
        !needle ||
        adminRowMatches(
          needle,
          category.name,
          category.slug,
          category.id,
          category.description,
          category.image
        )

      const parentMatch =
        filters.parent === ADMIN_FILTER_ALL_VALUE
          ? true
          : filters.parent === '__root__'
            ? !category.parentId
            : category.parentId === filters.parent

      const genderMatch =
        filters.gender === ADMIN_FILTER_ALL_VALUE
          ? true
          : category.gender === filters.gender

      const typeMatch =
        filters.type === ADMIN_FILTER_ALL_VALUE
          ? true
          : (category.productType ?? '') === filters.type

      const activeMatch =
        filters.active === ADMIN_FILTER_ALL_VALUE
          ? true
          : filters.active === 'true'
            ? category.isActive
            : !category.isActive

      return (
        searchMatch && parentMatch && genderMatch && typeMatch && activeMatch
      )
    })
  }, [data, filters])
}
