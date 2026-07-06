import { useCallback } from 'react'
import { Modal } from 'antd'
import toast from 'react-hot-toast'
import i18n from 'i18next'
import dayjs from 'dayjs'
import {
  deleteAdminProduct,
  restoreAdminProduct,
  updateAdminProductActive,
  exportAdminProducts
} from '@/api/admin-api'
import { buildAdminProductView } from '@/components/admin/admin-products-utils'
import type { AdminProduct, ProductView } from '@/types'

type SelectionState = {
  selectedRowKeys: React.Key[]
  viewProduct: ProductView | null
}

type ProductActionsParams = {
  refresh: () => Promise<void>
  editing: {
    setProduct: (p: AdminProduct | null) => void
  }
  modals: {
    setProduct: (open: boolean) => void
  }
  clearDirty: (key: string) => void
  setSelectionState: React.Dispatch<React.SetStateAction<SelectionState>>
}

export function useProductActions({
  refresh,
  editing,
  modals,
  clearDirty,
  setSelectionState
}: ProductActionsParams) {
  const onCreate = useCallback(() => {
    editing.setProduct(null)
    clearDirty('product')
    modals.setProduct(true)
  }, [clearDirty, editing, modals])

  const onEdit = useCallback(
    (product: AdminProduct) => {
      editing.setProduct(product)
      clearDirty('product')
      modals.setProduct(true)
    },
    [clearDirty, editing, modals]
  )

  const onDelete = useCallback(
    (product: AdminProduct) => {
      Modal.confirm({
        title: i18n.t('admin.deleteTitle', { name: product.name }),
        content: i18n.t('admin.deleteConfirmSimple'),
        okText: i18n.t('admin.deleteConfirmOk'),
        cancelText: i18n.t('admin.deleteConfirmCancel'),
        okButtonProps: { danger: true },
        onOk: async () => {
          await deleteAdminProduct(product.id)
          toast.success(i18n.t('admin.productDeleted'))
          await refresh()
        }
      })
    },
    [refresh]
  )

  const onToggleActive = useCallback(
    async (product: AdminProduct, isActive: boolean) => {
      await updateAdminProductActive(product.id, { isActive })
      toast.success(
        isActive ? i18n.t('admin.productActivated') : i18n.t('admin.productDeactivated')
      )
      await refresh()
    },
    [refresh]
  )

  const onRestore = useCallback(
    async (product: AdminProduct) => {
      Modal.confirm({
        title: i18n.t('admin.restoreTitle', { name: product.name }),
        content: i18n.t('admin.deleteConfirmSimple'),
        okText: i18n.t('admin.deleteConfirmOk'),
        cancelText: i18n.t('admin.deleteConfirmCancel'),
        onOk: async () => {
          await restoreAdminProduct(product.id)
          toast.success(i18n.t('admin.productRestored'))
          await refresh()
        }
      })
    },
    [refresh]
  )

  const openProductView = useCallback(
    (product: AdminProduct, updatedAt?: string | null) => {
      setSelectionState((current) => ({
        ...current,
        viewProduct: buildAdminProductView(product, updatedAt)
      }))
    },
    [setSelectionState]
  )

  const onExportExcel = useCallback(async (filteredData: AdminProduct[]) => {
    if (filteredData.length === 0) {
      toast.error(i18n.t('admin.noProductsExport'))
      return
    }
    try {
      const loadingToast = toast.loading(i18n.t('admin.exportingExcel'))
      const ids = filteredData.map((p) => p.id)
      const blob = await exportAdminProducts(ids)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `products_export_${dayjs().format('YYYYMMDD')}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success(i18n.t('admin.exportExcelSuccess'), { id: loadingToast })
    } catch (error) {
      toast.error(i18n.t('admin.exportExcelFailed'))
      console.error('Export error:', error)
    }
  }, [])

  return {
    onCreate,
    onEdit,
    onDelete,
    onToggleActive,
    onRestore,
    openProductView,
    onExportExcel
  }
}
