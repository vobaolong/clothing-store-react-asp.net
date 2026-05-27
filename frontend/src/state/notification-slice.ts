import {
  createSelector,
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import type {
  NotificationDto,
  NotificationState,
  RealtimeNotificationDto
} from '@/types/notification'

type SetNotificationsPayload = {
  notifications: NotificationDto[]
  unreadCount: number
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  realtimeNotifications: []
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setNotifications: (
      state,
      action: PayloadAction<SetNotificationsPayload>
    ) => {
      state.notifications = action.payload.notifications
      state.unreadCount = action.payload.unreadCount
      state.isLoading = false
      state.error = null
    },
    addRealtimeNotification: (
      state,
      action: PayloadAction<RealtimeNotificationDto>
    ) => {
      state.realtimeNotifications.unshift(action.payload)

      if (state.realtimeNotifications.length > 10) {
        state.realtimeNotifications = state.realtimeNotifications.slice(0, 10)
      }

      state.unreadCount += 1
    },
    removeRealtimeNotification: (state, action: PayloadAction<number>) => {
      state.realtimeNotifications.splice(action.payload, 1)
    },
    clearRealtimeNotifications: (state) => {
      state.realtimeNotifications = []
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      if (notification && !notification.isRead) {
        notification.isRead = true
        notification.readAt = new Date().toISOString()
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        if (!notification.isRead) {
          notification.isRead = true
          notification.readAt = new Date().toISOString()
        }
      })
      state.unreadCount = 0
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload
    },
    addNotification: (state, action: PayloadAction<NotificationDto>) => {
      state.notifications.unshift(action.payload)

      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }

      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },
    clearError: (state) => {
      state.error = null
    },
    reset: () => initialState
  }
})

export const {
  setLoading,
  setError,
  setNotifications,
  addRealtimeNotification,
  removeRealtimeNotification,
  clearRealtimeNotifications,
  markNotificationAsRead,
  markAllAsRead,
  setUnreadCount,
  addNotification,
  clearError,
  reset
} = notificationSlice.actions

export const selectNotificationState = (state: RootState) => state.notifications
export const selectNotifications = (state: RootState) =>
  state.notifications.notifications
export const selectRealtimeNotifications = (state: RootState) =>
  state.notifications.realtimeNotifications
export const selectNotificationUnreadCount = (state: RootState) =>
  state.notifications.unreadCount
export const selectNotificationIsLoading = (state: RootState) =>
  state.notifications.isLoading
export const selectNotificationError = (state: RootState) =>
  state.notifications.error
export const selectRecentRealtimeNotifications = createSelector(
  selectRealtimeNotifications,
  (notifications) => notifications.slice(0, 10)
)

export default notificationSlice.reducer
