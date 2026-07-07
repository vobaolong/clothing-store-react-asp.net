import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  getAuthToken,
  getCurrentUser,
  removeAuthToken,
  removeRememberMeToken,
  setAuthToken,
  setRememberMeToken
} from '@/state/auth/auth-session'
import type { JwtPayload, LoginResponseDto } from '@/types'

type AuthState = {
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
    setAuth: (state, action: PayloadAction<string | LoginResponseDto>) => {
      const payload = action.payload
      if (typeof payload === 'string') {
        setAuthToken(payload)
        removeRememberMeToken()
      } else {
        setAuthToken(payload.token)
        if (payload.rememberMeToken) {
          setRememberMeToken(payload.rememberMeToken)
        } else {
          removeRememberMeToken()
        }
      }
      state.token = getAuthToken()
      state.user = getCurrentUser()
      state.isAuthenticated = true
    },
    logout: (state) => {
      removeAuthToken()
      removeRememberMeToken()
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
export default authSlice.reducer
