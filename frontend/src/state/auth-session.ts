import type { JwtPayload } from '@/types'

const TOKEN_KEY = 'authToken'

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const getCurrentUser = (): JwtPayload | null => {
  const token = getAuthToken()
  if (!token) return null

  const payload = decodeJwt(token)
  if (!payload) return null

  if (payload.exp * 1000 < Date.now()) {
    removeAuthToken()
    return null
  }

  return payload
}

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

export const isAdmin = (): boolean => {
  const user = getCurrentUser()
  if (!user) return false
  if (user.isAdmin === true) return true

  const role =
    (user as JwtPayload & Record<string, unknown>).role ??
    (user as JwtPayload & Record<string, unknown>)[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ]

  return role === 'Admin'
}
