import { createContext, use } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminEditor } from '@/hooks/useAdminEditor'
import type {
  AdminBanner,
  AdminCategory,
  AdminProduct,
  AdminProductListMode,
  Coupon,
} from '@/types'

export interface AdminContextType {
  // Navigation & General
  navigate: ReturnType<typeof useNavigate>
  refresh: () => Promise<void>
  confirmDelete: (title: string, onOk: () => Promise<void>) => void

  // Editor
  editor: ReturnType<typeof useAdminEditor>

  // Filters
  filters: {
    productListMode: AdminProductListMode
    setProductListMode: (mode: AdminProductListMode) => void
    orderStatusFilter: string
    setOrderStatusFilter: (status: string) => void
  }

  // Modals UI
  modals: {
    product: boolean
    category: boolean
    bulkCategory: boolean
    coupon: boolean
    banner: boolean
    orderDetailId: string | null
    setProduct: (open: boolean) => void
    setCategory: (open: boolean) => void
    setBulkCategory: (open: boolean) => void
    setCoupon: (open: boolean) => void
    setBanner: (open: boolean) => void
    setOrderDetailId: (id: string | null) => void
  }

  // Editing State
  editing: {
    product: AdminProduct | null
    setProduct: (p: AdminProduct | null) => void
    category: AdminCategory | null
    setCategory: (c: AdminCategory | null) => void
    coupon: Coupon | null
    setCoupon: (c: Coupon | null) => void
    banner: AdminBanner | null
    setBanner: (b: AdminBanner | null) => void
  }

  // Success Callbacks
  onSaved: {
    product: () => Promise<void>
    category: () => Promise<void>
    bulkCategory: () => Promise<void>
    coupon: () => Promise<void>
    banner: () => Promise<void>
  }
}

export const AdminContext = createContext<AdminContextType | undefined>(
  undefined,
)

export function useAdmin() {
  const context = use(AdminContext)
  if (!context) throw new Error('useAdmin must be used within AdminProvider')
  return context
}
