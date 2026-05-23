import toast from 'react-hot-toast'
import { bulkUpdateAdminProductsActive } from '@/api/admin-api'

export function useBulkActivate(onRefresh: () => Promise<void>) {
  const handleBulkUpdateActive = async (
    selectedIds: string[],
    isActive: boolean,
    onClearSelection: () => void
  ) => {
    try {
      await bulkUpdateAdminProductsActive({
        ids: selectedIds,
        isActive
      })
      toast.success(
        isActive ? 'Kích hoạt thành công' : 'Huỷ kích hoạt thành công'
      )
      onClearSelection()
      await onRefresh()
    } catch {
      toast.error('Bulk update failed')
    }
  }

  return handleBulkUpdateActive
}
