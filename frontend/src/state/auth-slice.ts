import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  getAuthToken,
  getCurrentUser,
  removeAuthToken,
  setAuthToken
} from '@/state/auth-session'
import type { RootState } from '@/app/store'
import type { JwtPayload } from '@/types'

interface AuthState {
  token: string | null
  user: JwtPayload | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  token: getAuthToken(),
  user: getCurrentUser(),
  isAuthenticated: !!getAuthToken() && !!getCurrentUser()
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<string>) => {
      setAuthToken(action.payload)
      state.token = action.payload
      state.user = getCurrentUser()
      state.isAuthenticated = true
    },
    logout: (state) => {
      removeAuthToken()
      state.token = null
      state.user = null
      state.isAuthenticated = false
    },
    updateUser: (state) => {
      state.user = getCurrentUser()
      state.isAuthenticated = !!state.token && !!state.user
    }
  }
})

export const { setAuth, logout, updateUser } = authSlice.actions

export const selectAuth = (state: RootState) => state.auth
export const selectAuthToken = (state: RootState) => state.auth.token
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated

export default authSlice.reducer
