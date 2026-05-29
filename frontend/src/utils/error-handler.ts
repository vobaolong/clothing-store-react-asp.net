import axios from 'axios'
import toast from 'react-hot-toast'

interface ApiError {
  message?: string
  Message?: string
  errors?: Record<string, string[] | string>
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (typeof data === 'string' && (data as string).trim())
      return (data as string).trim()
    if (data && typeof data === 'object') {
      const message = data.message || data.Message
      if (typeof message === 'string' && message.trim()) return message.trim()

      const errors = data.errors
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors)[0]
        if (Array.isArray(firstError) && firstError[0])
          return String(firstError[0])
        if (typeof firstError === 'string') return firstError
      }
    }
  }

  if (error instanceof Error) return error.message
  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
}

export const handleApiError = (error: unknown, defaultMessage?: string) => {
  const message = getApiErrorMessage(error)
  toast.error(message || defaultMessage || 'Lỗi kết nối server')
  return message
}

export const FALLBACK_IMG =
  'https://www.mangobeds.com/images/image-fallback.jpg'
