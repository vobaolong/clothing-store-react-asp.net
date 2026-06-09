import type { RootState } from '@/app/store'

export const selectAuth = (state: RootState) => state.auth
export const selectAuthToken = (state: RootState) => state.auth.token
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated
