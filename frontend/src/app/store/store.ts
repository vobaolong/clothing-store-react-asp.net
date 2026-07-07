import { configureStore } from '@reduxjs/toolkit'
import {
  loadCartItemsFromStorage,
  saveCartItemsToStorage
} from '@/utils/cart-storage'
import { isAuthenticated } from '@/state/auth/auth-session'
import { cartListenerMiddleware } from '@/state/cart-listener'
import cartReducer from '@/state/cart-slice'
import notificationReducer from '@/state/notification-slice'
import authReducer from '@/state/auth/auth-slice'

const preloadedCartItems =
  typeof window !== 'undefined' && !isAuthenticated()
    ? loadCartItemsFromStorage()
    : []

if (typeof window !== 'undefined' && isAuthenticated()) {
  localStorage.removeItem('cart_items')
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    notifications: notificationReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(cartListenerMiddleware.middleware),
  preloadedState: {
    cart: {
      items: preloadedCartItems,
      isDrawerOpen: false,
      itemsLoading: false
    }
  }
})

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState() as ReturnType<typeof store.getState>
    if (!state.auth.isAuthenticated) {
      saveCartItemsToStorage(state.cart.items)
    }
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
