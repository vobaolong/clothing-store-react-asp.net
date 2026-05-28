import { useCallback } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import {
  deleteAdminProduct,
  restoreAdminProduct,
  updateAdminProductActive,
  exportAdminProducts,
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

export function useProductActions({ refresh, editing, modals, clearDirty, setSelectionState }: ProductActionsParams) {
  const onCreate = useCallback(() => {
    editing.setProduct(null)
    clearDirty('product')
    modals.setProduct(true)
  }, [clearDirty, editing, modals])

  const onEdit = useCallback((product: AdminProduct) => {
    editing.setProduct(product)
    clearDirty('product')
    modals.setProduct(true)
  }, [clearDirty, editing, modals])

  const onDelete = useCallback((product: AdminProduct) => {
    return async () => {
      await deleteAdminProduct(product.id)
      toast.success('Sản phẩm đã được xóa')
      await refresh()
    }
  }, [refresh])

  const onToggleActive = useCallback(async (product: AdminProduct, isActive: boolean) => {
    await updateAdminProductActive(product.id, { isActive })
    toast.success(isActive ? 'Sản phẩm đã được kích hoạt' : 'Sản phẩm đã được vô hiệu hóa')
    await refresh()
  }, [refresh])

  const onRestore = useCallback(async (product: AdminProduct) => {
    await restoreAdminProduct(product.id)
    toast.success('Sản phẩm đã được khôi phục')
    await refresh()
  }, [refresh])

  const openProductView = useCallback((product: AdminProduct, updatedAt?: string | null) => {
    setSelectionState((current) => ({
      ...current,
      viewProduct: buildAdminProductView(product, updatedAt),
    }))
  }, [setSelectionState])

  const onExportExcel = useCallback(async (filteredData: AdminProduct[]) => {
    if (filteredData.length === 0) {
      toast.error('Không có sản phẩm để xuất')
      return
    }
    try {
      const loadingToast = toast.loading('Đang xuất Excel...')
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
      toast.success('Xuất Excel thành công', { id: loadingToast })
    } catch (error) {
      toast.error('Xuất Excel thất bại')
      console.error('Export error:', error)
    }
  }, [])

  return { onCreate, onEdit, onDelete, onToggleActive, onRestore, openProductView, onExportExcel }
}
