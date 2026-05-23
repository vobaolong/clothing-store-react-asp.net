import axios from 'axios'
import { getAuthToken, removeAuthToken } from '@/state/auth-session'
import toast from 'react-hot-toast'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5230/api',
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
  },
)
