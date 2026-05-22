import { configureStore } from '@reduxjs/toolkit'
import {
  loadCartItemsFromStorage,
  saveCartItemsToStorage
} from '@/utils/cart-storage'
import cartReducer from '@/state/cart-slice'
import notificationReducer from '@/state/notification-slice'
import authReducer from '@/state/auth-slice'

const preloadedCartItems =
  typeof window !== 'undefined' ? loadCartItemsFromStorage() : []

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    notifications: notificationReducer,
    auth: authReducer
  },
  preloadedState: {
    cart: {
      items: preloadedCartItems,
      isDrawerOpen: false
    }
  }
})

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState() as ReturnType<typeof store.getState>
    saveCartItemsToStorage(state.cart.items)
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
