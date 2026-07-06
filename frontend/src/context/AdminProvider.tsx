import { useState, useCallback, type ReactNode } from 'react'
import { Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'
import { useAdminEditor } from '@/hooks/useAdminEditor'
import type {
  AdminBanner,
  AdminCategory,
  AdminProduct,
  AdminProductListMode,
  Coupon
} from '@/types'
import { AdminContext, type AdminContextType } from '@/context/AdminContext'

export function AdminProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const editor = useAdminEditor()
  const { clearDirty } = editor

  const [filters, setFilters] = useState({
    productListMode: 'active' as AdminProductListMode,
    orderStatusFilter: 'all' as string
  })

  const [modals, setModals] = useState({
    product: false,
    category: false,
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
        content: i18n.t('admin.deleteConfirmContent'),
        okText: i18n.t('admin.deleteConfirmOk'),
        cancelText: i18n.t('admin.deleteConfirmCancel'),
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
      setCoupon: (open) => setModals((prev) => ({ ...prev, coupon: open })),
      setBanner: (open) => setModals((prev) => ({ ...prev, banner: open })),
      setOrderDetailId: (id) =>
        setModals((prev) => ({ ...prev, orderDetailId: id }))
    },
    editing: {
      ...editing,
      setProduct: (product) =>
        setEditing((prev) => ({ ...prev, product: product })),
      setCategory: (c) => setEditing((prev) => ({ ...prev, category: c })),
      setCoupon: (c) => setEditing((prev) => ({ ...prev, coupon: c })),
      setBanner: (b) => setEditing((prev) => ({ ...prev, banner: b }))
    },
    onSaved: {
      product: () => handleSuccess('product', 'product'),
      category: () => handleSuccess('category', 'category'),
      coupon: () => handleSuccess('coupon', 'coupon'),
      banner: () => handleSuccess('banner', 'banner')
    }
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
