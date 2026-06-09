import axios from 'axios'
import toast from 'react-hot-toast'

import { getAuthToken, removeAuthToken } from '@/state/auth/auth-session'
import type { ApiResponse } from '@/types/common.type'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5230/api'
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken()
      if (!window.location.pathname.startsWith('/login')) {
        toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      }
    }
    return Promise.reject(error)
  }
)

export const apiData = async <T>(
  request: Promise<{ data: ApiResponse<T> }>
): Promise<T> => (await request).data.data

export const apiVoid = async (request: Promise<unknown>): Promise<void> => {
  await request
}
