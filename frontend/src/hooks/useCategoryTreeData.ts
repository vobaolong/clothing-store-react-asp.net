import { useMemo } from 'react'
import i18n from 'i18next'
import {
  buildCategoryTreeSelectData,
  removeCategorySubtreeFromTree
} from '@/utils/category-tree'
import type { AdminCategory } from '@/types'

export function useCategoryTreeData(data: AdminCategory[]) {
  const parentFilterTreeData = useMemo(() => {
    const tree = buildCategoryTreeSelectData(data)
    return [{ title: i18n.t('admin.categoryParentPlaceholder'), value: '__root__' }, ...tree]
  }, [data])

  const getQuickUpdateParentTreeData = useMemo(() => {
    const fullTree = buildCategoryTreeSelectData(data)
    return (rowId: string) => removeCategorySubtreeFromTree(fullTree, rowId)
  }, [data])

  return {
    parentFilterTreeData,
    getQuickUpdateParentTreeData
  }
}
