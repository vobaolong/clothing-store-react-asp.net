import { useMemo } from 'react'
import {
  buildCategoryTreeSelectData,
  removeCategorySubtreeFromTree
} from '@/utils/category-tree'
import type { AdminCategory } from '@/types'

export function useCategoryTreeData(data: AdminCategory[]) {
  const parentFilterTreeData = useMemo(() => {
    const tree = buildCategoryTreeSelectData(data)
    return [{ title: 'Không có danh mục cha', value: '__root__' }, ...tree]
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
