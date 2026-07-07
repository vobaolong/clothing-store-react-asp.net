import { STORAGE_KEYS } from '@/constants/storage-keys.constant'
import type { JwtPayload } from '@/types'

const TOKEN_KEY = STORAGE_KEYS.authToken
const REMEMBER_KEY = STORAGE_KEYS.rememberMeToken

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY)
}

export const setAuthToken = (token: string): void => {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export const removeAuthToken = (): void => {
  sessionStorage.removeItem(TOKEN_KEY)
}

export const getRememberMeToken = (): string | null => {
  return localStorage.getItem(REMEMBER_KEY)
}

export const setRememberMeToken = (token: string): void => {
  localStorage.setItem(REMEMBER_KEY, token)
}

export const removeRememberMeToken = (): void => {
  localStorage.removeItem(REMEMBER_KEY)
}

export const clearAllAuth = (): void => {
  removeAuthToken()
  removeRememberMeToken()
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
        .join('')
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
