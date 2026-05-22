import { DeleteOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'
import toast from 'react-hot-toast'
import {
  bulkDeleteAdminProductsPermanent,
  bulkRestoreAdminProducts,
  getAdminApiErrorMessage
} from '@/api/admin-api'

type AdminTrashBulkActionsProps = {
  hasSelection: boolean
  selectedIds: string[]
  selectedCount: number
  onClearSelection: () => void
  onRefresh: () => Promise<void>
}

export default function AdminTrashBulkActions({
  hasSelection,
  selectedIds,
  selectedCount,
  onClearSelection,
  onRefresh
}: AdminTrashBulkActionsProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        type='default'
        color='blue'
        disabled={!hasSelection}
        icon={<UndoOutlined />}
        onClick={async () => {
          try {
            await bulkRestoreAdminProducts({ ids: selectedIds })
            toast.success('Items restored successfully')
            onClearSelection()
            await onRefresh()
          } catch {
            toast.error('Restore failed')
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
            title: `Hard delete ${selectedCount} items?`,
            content:
              'This action cannot be undone. Items that have appeared in orders will be skipped.',
            okText: 'Hard delete',
            okButtonProps: { danger: true },
            onOk: async () => {
              try {
                const response = await bulkDeleteAdminProductsPermanent({
                  ids: selectedIds
                })
                onClearSelection()
                await onRefresh()
                if (response.deleted === 0) {
                  toast.error(
                    'No items could be permanently deleted (either in orders or not in trash).'
                  )
                  return Promise.reject(new Error('none-deleted'))
                }

                const parts = [`Hard deleted ${response.deleted} items.`]
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
    </div>
  )
}
