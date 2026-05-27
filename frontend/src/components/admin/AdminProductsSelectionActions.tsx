import { CheckCircleOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Modal, Tag } from 'antd'
import type { Key } from 'react'
import toast from 'react-hot-toast'
import {
  bulkDeleteAdminProducts,
  bulkDeleteAdminProductsPermanent,
  bulkRestoreAdminProducts,
  bulkUpdateAdminProductsActive,
  getAdminApiErrorMessage
} from '@/api/admin-api'

type AdminProductsSelectionActionsProps = {
  isTrash: boolean
  selectedRowKeys: Key[]
  onClearSelection: () => void
  onRefresh: () => Promise<void>
}

export default function AdminProductsSelectionActions({
  isTrash,
  selectedRowKeys,
  onClearSelection,
  onRefresh
}: AdminProductsSelectionActionsProps) {
  const selectedIds = selectedRowKeys.map(String)
  const selectedCount = selectedIds.length

  return (
    <div className='fixed z-50 p-4 bg-white border border-blue-300 rounded-lg shadow-lg left-1/2 top-4/5 -translate-x-1/2'>
      <div className='flex flex-col gap-4 items-center sm:flex-row'>
        <Tag
          icon={<CheckCircleOutlined />}
          variant='outlined'
          color='blue'
          className='font-semibold text-gray-700 text-nowrap h-8! items-center flex!'
        >
          {selectedCount} sản phẩm
          {selectedCount !== 1 ? 's' : ''} được chọn
        </Tag>
        {isTrash ? (
          <>
            <Button
              type='default'
              color='blue'
              icon={<UndoOutlined />}
              onClick={async () => {
                try {
                  await bulkRestoreAdminProducts({ ids: selectedIds })
                  toast.success('Products restored')
                  onClearSelection()
                  await onRefresh()
                } catch {
                  toast.error('Restore failed')
                }
              }}
            >
              Khôi phục
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: `Xóa vĩnh viễn ${selectedCount} sản phẩm?`,
                  content:
                    'Hành động này không thể hoàn tác. Sản phẩm đã từng xuất hiện trong đơn hàng sẽ bị bỏ qua.',
                  okText: 'Xóa vĩnh viễn',
                  cancelText: 'Hủy',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      const response = await bulkDeleteAdminProductsPermanent({
                        ids: selectedIds
                      })
                      onClearSelection()
                      if (response.deleted === 0) {
                        toast.error(
                          'Không xóa vĩnh viễn được sản phẩm nào (có trong đơn hoặc không còn trong thùng rác).'
                        )
                        return Promise.reject(new Error('none-deleted'))
                      }

                      await onRefresh()
                      const parts = [
                        `Đã xóa vĩnh viễn ${response.deleted} sản phẩm.`
                      ]
                      if (response.skippedDueToOrders > 0)
                        parts.push(
                          `${response.skippedDueToOrders} bỏ qua (liên kết đơn hàng).`
                        )
                      if (response.skippedNotInTrash > 0)
                        parts.push(
                          `${response.skippedNotInTrash} bỏ qua (không ở thùng rác).`
                        )
                      toast.success(parts.join(' '))
                    } catch (error) {
                      if (
                        error instanceof Error &&
                        error.message === 'none-deleted'
                      ) {
                        return Promise.reject(error)
                      }
                      toast.error(
                        getAdminApiErrorMessage(error) ?? 'Xóa vĩnh viễn thất bại'
                      )
                      return Promise.reject(error)
                    }
                  }
                })
              }}
            >
              Xóa vĩnh viễn
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={async () => {
                try {
                  await bulkUpdateAdminProductsActive({
                    ids: selectedIds,
                    isActive: true
                  })
                  toast.success('Kích hoạt sản phẩm thành công')
                  onClearSelection()
                  await onRefresh()
                } catch {
                  toast.error('Kích hoạt sản phẩm thất bại')
                }
              }}
            >
              Kích hoạt
            </Button>
            <Button
              onClick={async () => {
                try {
                  await bulkUpdateAdminProductsActive({
                    ids: selectedIds,
                    isActive: false
                  })
                  toast.success('Ngừng kích hoạt sản phẩm thành công')
                  onClearSelection()
                  await onRefresh()
                } catch {
                  toast.error('Ngừng kích hoạt sản phẩm thất bại')
                }
              }}
            >
              Ngừng kích hoạt
            </Button>
            <Button
              type='primary'
              onClick={() => {
                Modal.confirm({
                  title: `Xóa ${selectedCount} sản phẩm?`,
                  content: 'Hành động này không thể hoàn tác.',
                  okText: 'Xóa',
                  cancelText: 'Hủy',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await bulkDeleteAdminProducts({ ids: selectedIds })
                      toast.success('Xóa sản phẩm thành công')
                      onClearSelection()
                      await onRefresh()
                    } catch {
                      toast.error('Xóa sản phẩm thất bại')
                      throw new Error('abort')
                    }
                  }
                })
              }}
            >
              Xóa
            </Button>
          </>
        )}
      </div>
    </div>
  )
}