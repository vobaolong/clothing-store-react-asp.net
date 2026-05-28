import type { RootState } from '@/app/store'
import type { JwtPayload } from '@/types'

export const selectAuth = (state: RootState) => state.auth
export const selectAuthToken = (state: RootState) => state.auth.token
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated

export const selectIsAdminUser = (state: RootState) => {
  const user = selectAuthUser(state)
  if (!user) return false
  if (user.isAdmin === true) return true

  const role =
    (user as JwtPayload & Record<string, unknown>).role ??
    (user as JwtPayload & Record<string, unknown>)[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ]

  return role === 'Admin'
}
