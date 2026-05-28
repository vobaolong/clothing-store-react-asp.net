import { useState, useCallback } from 'react'
import type { ProductView } from '@/types'

export function useProductSelection() {
  const [selectionState, setSelectionState] = useState({
    selectedRowKeys: [] as React.Key[],
    viewProduct: null as ProductView | null,
  })

  const rowSelection = {
    selectedRowKeys: selectionState.selectedRowKeys,
    onChange: (keys: React.Key[]) =>
      setSelectionState((current) => ({ ...current, selectedRowKeys: keys })),
  }

  const clearSelection = useCallback(
    () => setSelectionState((current) => ({ ...current, selectedRowKeys: [] })),
    [],
  )

  const hasSelection = selectionState.selectedRowKeys.length > 0

  return { selectionState, setSelectionState, rowSelection, clearSelection, hasSelection }
}
