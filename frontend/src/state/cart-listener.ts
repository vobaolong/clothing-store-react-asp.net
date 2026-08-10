import type { TypedStartListening } from '@reduxjs/toolkit'
import { createListenerMiddleware } from '@reduxjs/toolkit'
import * as cartApi from '@/api/cart-api'
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  updateCartVariant,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem
} from '@/state/cart-slice'
import type { RootState } from '@/app/store'

type AppStartListening = TypedStartListening<RootState>

export const cartListenerMiddleware = createListenerMiddleware()

const startListening =
  cartListenerMiddleware.startListening as AppStartListening

startListening({
  predicate: (_action, currentState) => {
    if (_action.type !== 'cart/addToCart') return false
    return (currentState as RootState).auth.isAuthenticated
  },
  effect: async (action, listenerApi) => {
    const payload = action as ReturnType<typeof addToCart>
    const { productId, productVariantId, quantity } = {
      productId: payload.payload.product.id,
      productVariantId:
        payload.payload.selectedVariant?.id ??
        payload.payload.productVariantId ??
        '',
      quantity: payload.payload.quantity
    }
    if (!productVariantId) return
    try {
      const dto = await cartApi.addToCart({
        productId,
        productVariantId,
        quantity
      })
      listenerApi.dispatch(addServerCartItem(dto))
    } catch {
      // silent — client state already updated optimistically
    }
  }
})

startListening({
  predicate: (_action, currentState) => {
    if (_action.type !== 'cart/updateQuantity') return false
    return (currentState as RootState).auth.isAuthenticated
  },
  effect: async (action, listenerApi) => {
    const payload = action as ReturnType<typeof updateQuantity>
    const { id, productVariantId, quantity } = payload.payload
    const item = (listenerApi.getState() as RootState).cart.items.find(
      (i) => i.id === id && i.productVariantId === productVariantId
    )
    if (item?.cartItemId) {
      try {
        const dto = await cartApi.updateCartQuantity(item.cartItemId, quantity)
        listenerApi.dispatch(updateServerCartItem(dto))
      } catch {
        /* silent */
      }
    }
  }
})

startListening({
  predicate: (_action, currentState) => {
    if (_action.type !== 'cart/removeFromCart') return false
    return (currentState as RootState).auth.isAuthenticated
  },
  effect: async (action, listenerApi) => {
    const payload = action as ReturnType<typeof removeFromCart>
    const { cartItemId } = payload.payload
    if (!cartItemId) return
    try {
      await cartApi.removeFromCart(cartItemId)
      listenerApi.dispatch(removeServerCartItem(cartItemId))
    } catch {
      /* silent — cart is re-fetched on next load */
    }
  }
})

startListening({
  predicate: (_action, currentState) => {
    if (_action.type !== 'cart/updateCartVariant') return false
    return (currentState as RootState).auth.isAuthenticated
  },
  effect: async (action, listenerApi) => {
    const payload = action as ReturnType<typeof updateCartVariant>
    const { cartItemId, newProductVariantId, id, quantity } = payload.payload
    if (cartItemId) {
      try {
        await cartApi.removeFromCart(cartItemId)
        listenerApi.dispatch(removeServerCartItem(cartItemId))
      } catch {
        /* silent */
      }
    }
    if (!newProductVariantId || !id) return
    const item = (listenerApi.getState() as RootState).cart.items.find(
      (i) => i.id === id && i.productVariantId === newProductVariantId
    )
    if (!item) return
    try {
      const dto = await cartApi.addToCart({
        productId: id,
        productVariantId: newProductVariantId,
        quantity
      })
      listenerApi.dispatch(addServerCartItem(dto))
    } catch {
      /* silent */
    }
  }
})

startListening({
  predicate: (_action, currentState) => {
    if (_action.type !== 'cart/clearCart') return false
    return (currentState as RootState).auth.isAuthenticated
  },
  effect: async () => {
    try {
      await cartApi.clearCartOnServer()
    } catch {
      /* silent */
    }
  }
})
