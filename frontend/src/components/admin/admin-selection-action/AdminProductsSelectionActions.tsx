import { useTranslation } from 'react-i18next'
import {
  CheckCircleOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  StopOutlined,
  UndoOutlined
} from '@ant-design/icons'
import { Button, Modal, Tag } from 'antd'
import type { Key } from 'react'
import toast from 'react-hot-toast'
import {
  bulkDeleteAdminProducts,
  bulkDeleteAdminProductsPermanent,
  bulkRestoreAdminProducts,
  bulkUpdateAdminProductsActive
} from '@/api/admin-api'
import { getApiErrorMessage } from '@/utils/error-handler'

type AdminProductsSelectionActionsProps = {
  isTrash: boolean
  selectedRowKeys: Key[]
  onClearSelection: () => void
  onRefresh: () => Promise<void>
  onExportExcel: () => void
}

export default function AdminProductsSelectionActions({
  isTrash,
  selectedRowKeys,
  onExportExcel,
  onClearSelection,
  onRefresh
}: AdminProductsSelectionActionsProps) {
  const { t } = useTranslation()
  const selectedIds = selectedRowKeys.map(String)
  const selectedCount = selectedIds.length

  return (
    <div className="fixed z-50 p-4 rounded-lg shadow-lg -translate-x-1/2 left-1/2 card top-4/5">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Tag
          icon={<CheckCircleOutlined />}
          variant="outlined"
          color="blue"
          className="font-semibold text-gray-700 text-nowrap h-8! flex! items-center"
        >
          {t('admin.productsCount', { count: selectedCount })}
        </Tag>
        <Button icon={<FileExcelOutlined />} onClick={onExportExcel}>
          <span className="hidden md:block">{t('admin.exportButton')}</span>
        </Button>
        {isTrash ? (
          <>
            <Button
              type="default"
              color="blue"
              icon={<UndoOutlined />}
              onClick={async () => {
                try {
                  await bulkRestoreAdminProducts({ ids: selectedIds })
                  toast.success(t('admin.restoreSuccess'))
                  onClearSelection()
                  await onRefresh()
                } catch {
                  toast.error(t('admin.restoreFailed'))
                }
              }}
            >
              <span className="hidden md:block">
                {t('admin.restoreButton')}
              </span>
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: t('admin.permanentDeleteTitle', {
                    count: selectedCount
                  }),
                  content: t('admin.permanentDeleteContent'),
                  okText: t('admin.permanentDeleteOk'),
                  cancelText: t('common.cancel'),
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      const response =
                        await bulkDeleteAdminProductsPermanent(selectedIds)
                      onClearSelection()
                      if (response.deleted === 0) {
                        toast.error(t('admin.permanentDeleteNone'))
                        return Promise.reject(new Error('none-deleted'))
                      }

                      await onRefresh()
                      const parts = [t('admin.permanentDeleteDone')]
                      if (response.skippedDueToOrders > 0)
                        parts.push(
                          t('admin.permanentDeleteSkippedOrders', {
                            count: response.skippedDueToOrders
                          })
                        )
                      if (response.skippedNotInTrash > 0)
                        parts.push(
                          t('admin.permanentDeleteSkippedTrash', {
                            count: response.skippedNotInTrash
                          })
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
                        getApiErrorMessage(
                          error,
                          t('admin.permanentDeleteFailed')
                        )
                      )
                      return Promise.reject(error)
                    }
                  }
                })
              }}
            >
              <span className="hidden md:block">
                {t('admin.permanentDeleteOk')}
              </span>
            </Button>
          </>
        ) : (
          <>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={async () => {
                try {
                  await bulkUpdateAdminProductsActive({
                    ids: selectedIds,
                    isActive: true
                  })
                  toast.success(t('admin.bulkActivateSuccess'))
                  onClearSelection()
                  await onRefresh()
                } catch {
                  toast.error(t('admin.bulkActivateFailed'))
                }
              }}
            >
              <span className="hidden md:block">{t('admin.activate')}</span>
            </Button>
            <Button
              icon={<StopOutlined />}
              onClick={async () => {
                try {
                  await bulkUpdateAdminProductsActive({
                    ids: selectedIds,
                    isActive: false
                  })
                  toast.success(t('admin.bulkDeactivateSuccess'))
                  onClearSelection()
                  await onRefresh()
                } catch {
                  toast.error(t('admin.bulkDeactivateFailed'))
                }
              }}
            >
              <span className="hidden md:block">{t('admin.deactivate')}</span>
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: t('admin.bulkDeleteTitle', { count: selectedCount }),
                  content: t('admin.bulkDeleteContent'),
                  okText: t('admin.bulkDeleteOk'),
                  cancelText: t('common.cancel'),
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await bulkDeleteAdminProducts({ ids: selectedIds })
                      toast.success(t('admin.bulkDeleteSuccess'))
                      onClearSelection()
                      await onRefresh()
                    } catch {
                      toast.error(t('admin.bulkDeleteFailed'))
                      throw new Error('abort')
                    }
                  }
                })
              }}
            >
              <span className="hidden md:block">{t('common.delete')}</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
