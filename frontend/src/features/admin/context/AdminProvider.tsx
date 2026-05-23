import { useState, useCallback, type ReactNode } from 'react'
import { Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminEditor } from '@/features/admin/hooks/useAdminEditor'
import { FilterStatus } from '@/enums'
import type { AdminBanner, AdminCategory, AdminProduct, Coupon } from '@/types'
import type { AdminProductListMode } from '@/components/admin/AdminProductsSection'
import {
  AdminContext,
  type AdminContextType
} from '@/features/admin/context/AdminContext'

export function AdminProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const editor = useAdminEditor()
  const { clearDirty } = editor

  // Grouped States
  const [filters, setFilters] = useState({
    productListMode: 'active' as AdminProductListMode,
    orderStatusFilter: FilterStatus.ALL as string
  })

  const [modals, setModals] = useState({
    product: false,
    category: false,
    bulkCategory: false,
    coupon: false,
    banner: false,
    orderDetailId: null as string | null
  })

  const [editing, setEditing] = useState({
    product: null as AdminProduct | null,
    category: null as AdminCategory | null,
    coupon: null as Coupon | null,
    banner: null as AdminBanner | null
  })

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0]
        return typeof key === 'string' && key.startsWith('admin')
      }
    })
  }, [qc])

  const confirmDelete = useCallback(
    (title: string, onOk: () => Promise<void>) => {
      Modal.confirm({
        title,
        content:
          'Thao tác này sẽ làm thay đổi dữ liệu hoặc xóa vĩnh viễn nếu chưa từng được sử dụng. Bạn có chắc chắn?',
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          await onOk()
        }
      })
    },
    []
  )

  const handleSuccess = useCallback(
    async (modalKey: keyof typeof modals, dirtyKey: string) => {
      clearDirty(dirtyKey)
      setModals((prev) => ({ ...prev, [modalKey]: false }))
      await refresh()
    },
    [clearDirty, refresh]
  )

  const value: AdminContextType = {
    navigate,
    refresh,
    confirmDelete,
    editor,
    filters: {
      ...filters,
      setProductListMode: (mode) =>
        setFilters((prev) => ({ ...prev, productListMode: mode })),
      setOrderStatusFilter: (status) =>
        setFilters((prev) => ({ ...prev, orderStatusFilter: status }))
    },
    modals: {
      ...modals,
      setProduct: (open) => setModals((prev) => ({ ...prev, product: open })),
      setCategory: (open) => setModals((prev) => ({ ...prev, category: open })),
      setBulkCategory: (open) =>
        setModals((prev) => ({ ...prev, bulkCategory: open })),
      setCoupon: (open) => setModals((prev) => ({ ...prev, coupon: open })),
      setBanner: (open) => setModals((prev) => ({ ...prev, banner: open })),
      setOrderDetailId: (id) =>
        setModals((prev) => ({ ...prev, orderDetailId: id }))
    },
    editing: {
      ...editing,
      setProduct: (p) => setEditing((prev) => ({ ...prev, product: p })),
      setCategory: (c) => setEditing((prev) => ({ ...prev, category: c })),
      setCoupon: (c) => setEditing((prev) => ({ ...prev, coupon: c })),
      setBanner: (b) => setEditing((prev) => ({ ...prev, banner: b }))
    },
    onSaved: {
      product: () => handleSuccess('product', 'product'),
      category: () => handleSuccess('category', 'category'),
      bulkCategory: () => handleSuccess('bulkCategory', 'categoryBulk'),
      coupon: () => handleSuccess('coupon', 'coupon'),
      banner: () => handleSuccess('banner', 'banner')
    }
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
