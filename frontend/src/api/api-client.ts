import axios from 'axios'
import toast from 'react-hot-toast'
import i18n from 'i18next'

import { AUTH_REDIRECT_DELAY_MS } from '@/constants/timing.constant'
import {
  getAuthToken,
  setAuthToken,
  getRememberMeToken,
  setRememberMeToken,
  removeRememberMeToken,
  clearAllAuth
} from '@/state/auth/auth-session'
import type { ApiResponse } from '@/types/common.type'
import type { LoginResponseDto } from '@/types'
import { lp } from '@/utils/language-path'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5230/api'
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const handleRefreshToken = async (): Promise<string> => {
  const rememberMeToken = getRememberMeToken()
  if (!rememberMeToken) throw new Error('No remember-me token')

  const { data } = await axios.post<ApiResponse<LoginResponseDto>>(
    `${apiClient.defaults.baseURL}${API_ENDPOINTS.auth.tokenRefresh}`,
    { rememberMeToken }
  )
  const { token, rememberMeToken: newRememberMe } = data.data
  setAuthToken(token)
  if (newRememberMe) {
    setRememberMeToken(newRememberMe)
  } else {
    removeRememberMeToken()
  }
  return token
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    // only attempt refresh on 401, and only once per request
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === API_ENDPOINTS.auth.tokenRefresh
    ) {
      // 401 on login/refresh itself → full logout
      if (
        error.response?.status === 401 &&
        (originalRequest.url === API_ENDPOINTS.auth.tokenRefresh ||
          originalRequest.url === API_ENDPOINTS.auth.login)
      ) {
        clearAllAuth()
        if (!window.location.pathname.includes('/login')) {
          toast.error(i18n.t('message.error.sessionExpired'))
          setTimeout(() => {
            window.location.href = lp('/login')
          }, AUTH_REDIRECT_DELAY_MS)
        }
      }
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      // queue this request until the refresh completes
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    isRefreshing = true

    try {
      const newToken = await handleRefreshToken()
      // flush queue
      refreshQueue.forEach(({ resolve }) => resolve(newToken))
      refreshQueue = []
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      refreshQueue.forEach(({ reject }) => reject(refreshError))
      refreshQueue = []
      clearAllAuth()
      if (!window.location.pathname.includes('/login')) {
        toast.error(i18n.t('message.error.sessionExpired'))
        setTimeout(() => {
          window.location.href = lp('/login')
        }, AUTH_REDIRECT_DELAY_MS)
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export const apiData = async <T>(
  request: Promise<{ data: ApiResponse<T> }>
): Promise<T> => (await request).data.data

export const apiVoid = async (request: Promise<unknown>): Promise<void> => {
  await request
}
