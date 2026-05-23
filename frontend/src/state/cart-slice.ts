import {
  createSlice,
  createSelector,
  type PayloadAction
} from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import toast from 'react-hot-toast'
import type { CartState, Product } from '@/types'

const initialState: CartState = {
  items: [],
  isDrawerOpen: false
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    openDrawer: (state) => {
      state.isDrawerOpen = true
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false
    },
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product
        selectedVariant?: {
          id: string
          size: string
          color: string
          hex: string
        }
        productVariantId?: string
        selectedSize?: string
        selectedColor?: string
        quantity: number
      }>
    ) => {
      const { product, quantity } = action.payload
      const selectedVariant =
        action.payload.selectedVariant ??
        product.variants.find(
          (variant) => variant.id === action.payload.productVariantId
        )

      if (!selectedVariant) return

      const existingItem = state.items.find(
        (item) =>
          item.id === product.id &&
          item.selectedVariant.id === selectedVariant.id
      )

      if (existingItem) {
        existingItem.quantity += quantity
        toast.success('Cập nhật số lượng trong giỏ hàng')
      } else {
        state.items.push({
          ...product,
          selectedVariant,
          productVariantId: selectedVariant.id,
          selectedSize: selectedVariant.size,
          selectedColor: selectedVariant.color,
          isSelected: true,
          quantity
        })
        toast.success('Đã thêm vào giỏ hàng')
      }
      state.isDrawerOpen = true
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        productId?: string
        variantId?: string
        id?: string
        productVariantId?: string
        quantity: number
      }>
    ) => {
      const productId = action.payload.productId ?? action.payload.id
      const variantId =
        action.payload.variantId ?? action.payload.productVariantId
      const { quantity } = action.payload
      if (!productId || !variantId) return
      const item = state.items.find(
        (item) => item.id === productId && item.selectedVariant.id === variantId
      )
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
    },
    removeFromCart: (
      state,
      action: PayloadAction<{
        productId?: string
        variantId?: string
        id?: string
        productVariantId?: string
      }>
    ) => {
      const productId = action.payload.productId ?? action.payload.id
      const variantId =
        action.payload.variantId ?? action.payload.productVariantId
      if (!productId || !variantId) return
      state.items = state.items.filter(
        (item) =>
          !(item.id === productId && item.selectedVariant.id === variantId)
      )
      toast.success('Đã xóa khỏi giỏ hàng')
    },
    toggleSelectAllCartItems: (state, action: PayloadAction<boolean>) => {
      state.items.forEach((item) => {
        item.isSelected = action.payload
      })
    },
    toggleSelectCartItem: (
      state,
      action: PayloadAction<{
        id: string
        productVariantId: string
        isSelected: boolean
      }>
    ) => {
      const item = state.items.find(
        (x) =>
          x.id === action.payload.id &&
          x.productVariantId === action.payload.productVariantId
      )
      if (item) item.isSelected = action.payload.isSelected
    },
    updateCartVariant: (
      state,
      action: PayloadAction<{
        id: string
        oldProductVariantId: string
        newProductVariantId: string
        selectedSize: string
        selectedColor: string
      }>
    ) => {
      const item = state.items.find(
        (x) =>
          x.id === action.payload.id &&
          x.productVariantId === action.payload.oldProductVariantId
      )
      if (!item) return
      const targetVariant = item.variants.find(
        (v) => v.id === action.payload.newProductVariantId
      )
      if (!targetVariant) return
      item.productVariantId = targetVariant.id
      item.selectedVariant = {
        id: targetVariant.id,
        size: targetVariant.size,
        color: targetVariant.color,
        hex: targetVariant.hex
      }
      item.selectedSize = action.payload.selectedSize
      item.selectedColor = action.payload.selectedColor
    },
    clearSelectedCartItems: (state) => {
      state.items = state.items.filter((item) => !item.isSelected)
    },
    removePurchasedCartItems: (
      state,
      action: PayloadAction<Array<{ id: string; productVariantId: string }>>
    ) => {
      const purchasedKeys = new Set(
        action.payload.map((item) => `${item.id}::${item.productVariantId}`)
      )
      state.items = state.items.filter(
        (item) => !purchasedKeys.has(`${item.id}::${item.productVariantId}`)
      )
    },
    clearCart: (state) => {
      state.items = []
    }
  }
})

export const {
  openDrawer,
  closeDrawer,
  addToCart,
  updateQuantity,
  removeFromCart,
  toggleSelectAllCartItems,
  toggleSelectCartItem,
  updateCartVariant,
  clearSelectedCartItems,
  removePurchasedCartItems,
  clearCart
} = cartSlice.actions

export const closeCartDrawer = closeDrawer

export const selectCartItems = (state: RootState) => state.cart.items
export const selectIsCartDrawerOpen = (state: RootState) =>
  state.cart.isDrawerOpen

export const selectSelectedCartItems = createSelector(
  selectCartItems,
  (items) => items.filter((item) => item.isSelected)
)

export const selectCartItemCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
)

export default cartSlice.reducer
