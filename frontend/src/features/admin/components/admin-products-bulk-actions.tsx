import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  UndoOutlined
} from '@ant-design/icons'
import { Button, Modal } from 'antd'
import toast from 'react-hot-toast'
import {
  bulkDeleteAdminProducts,
  bulkDeleteAdminProductsPermanent,
  bulkUpdateAdminProductsActive,
  bulkRestoreAdminProducts,
  getAdminApiErrorMessage
} from '@/api/admin-api'
import type { AdminProduct } from '@/types'
import {
  AdminQueryRefreshButton,
  type AdminRefreshQuery
} from '@/features/admin/components/admin-query-refresh-button'

type AdminProductsBulkActionsProps = {
  isTrash: boolean
  hasSelection: boolean
  selectedIds: string[]
  selectedCount: number
  onClearSelection: () => void
  onRefresh: () => Promise<void>
  onImportExcel: () => void
  onCreate: () => void
  refreshQuery: AdminRefreshQuery<AdminProduct[], Error>
}

export default function AdminProductsBulkActions({
  isTrash,
  hasSelection,
  selectedIds,
  selectedCount,
  onClearSelection,
  onRefresh,
  onImportExcel,
  onCreate,
  refreshQuery
}: AdminProductsBulkActionsProps) {
  const handleBulkUpdateActive = async (isActive: boolean) => {
    try {
      await bulkUpdateAdminProductsActive({
        ids: selectedIds,
        isActive
      })
      toast.success(isActive ? 'Products activated' : 'Products deactivated')
      onClearSelection()
      await onRefresh()
    } catch {
      toast.error('Bulk update failed')
    }
  }

  return (
    <div className='flex flex-wrap justify-end gap-2'>
      {isTrash ? (
        <>
          <Button
            type='default'
            color='blue'
            disabled={!hasSelection}
            icon={<UndoOutlined />}
            onClick={async () => {
              try {
                await bulkRestoreAdminProducts({ ids: selectedIds })
                toast.success('Products restored successfully')
                onClearSelection()
                await onRefresh()
              } catch {
                toast.error('Products restore failed')
              }
            }}
          >
            Restore selected
          </Button>
          <Button
            danger
            disabled={!hasSelection}
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: `Hard delete ${selectedCount} products?`,
                content:
                  'This action cannot be undone. Products that have appeared in orders will be skipped.',
                okText: 'Hard delete',
                okButtonProps: { danger: true },
                onOk: async () => {
                  try {
                    const response = await bulkDeleteAdminProductsPermanent({
                      ids: selectedIds
                    })
                    if (response.deleted === 0) {
                      toast.error(
                        'No products could be permanently deleted (either in orders or not in the trash).'
                      )
                      return Promise.reject(new Error('none-deleted'))
                    }

                    onClearSelection()
                    await onRefresh()

                    const parts = [`Hard deleted ${response.deleted} products.`]
                    if (response.skippedDueToOrders > 0) {
                      parts.push(
                        `${response.skippedDueToOrders} skipped (linked to orders).`
                      )
                    }
                    if (response.skippedNotInTrash > 0) {
                      parts.push(
                        `${response.skippedNotInTrash} skipped (not in trash).`
                      )
                    }
                    toast.success(parts.join(' '))
                  } catch (error) {
                    if (
                      error instanceof Error &&
                      error.message === 'none-deleted'
                    ) {
                      return Promise.reject(error)
                    }
                    toast.error(
                      getAdminApiErrorMessage(error) ?? 'Hard delete failed'
                    )
                    return Promise.reject(error)
                  }
                }
              })
            }}
          >
            Hard delete selected
          </Button>
        </>
      ) : (
        <>
          <Button
            disabled={!hasSelection}
            onClick={() => handleBulkUpdateActive(true)}
          >
            Activate selected
          </Button>
          <Button
            disabled={!hasSelection}
            onClick={() => handleBulkUpdateActive(false)}
          >
            Deactivate selected
          </Button>
          <Button
            danger
            disabled={!hasSelection}
            onClick={() => {
              Modal.confirm({
                title: `Delete ${selectedCount} products?`,
                content: 'This action cannot be undone.',
                okText: 'Delete',
                cancelText: 'Cancel',
                okButtonProps: { danger: true },
                onOk: async () => {
                  try {
                    await bulkDeleteAdminProducts({ ids: selectedIds })
                    toast.success('Products deleted')
                    onClearSelection()
                    await onRefresh()
                  } catch {
                    toast.error('Bulk delete failed')
                    throw new Error('abort')
                  }
                }
              })
            }}
          >
            Delete selected
          </Button>
          <Button icon={<UploadOutlined />} onClick={onImportExcel}>
            Import Excel
          </Button>
          <AdminQueryRefreshButton query={refreshQuery} />
          <Button type='primary' icon={<PlusOutlined />} onClick={onCreate}>
            Add Product
          </Button>
        </>
      )}
    </div>
  )
}
