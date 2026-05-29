import { useMemo, useState } from 'react'
import type { TableRowSelection } from 'antd/es/table/interface'

export function useTableSelection<T extends { id?: string | number }>() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const rowSelection: TableRowSelection<T> = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys)
    }),
    [selectedRowKeys]
  )

  const clearSelection = () => setSelectedRowKeys([])
  const hasSelection = selectedRowKeys.length > 0
  const selectedIds = useMemo(
    () => selectedRowKeys.map(String),
    [selectedRowKeys]
  )

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    rowSelection,
    clearSelection,
    hasSelection,
    selectedIds
  }
}
