import toast from 'react-hot-toast'
import i18n from 'i18next'
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
        isActive ? i18n.t('admin.activateSuccess') : i18n.t('admin.deactivateSuccess')
      )
      onClearSelection()
      await onRefresh()
    } catch {
      toast.error(isActive ? i18n.t('admin.activateFailed') : i18n.t('admin.deactivateFailed'))
    }
  }

  return handleBulkUpdateActive
}
