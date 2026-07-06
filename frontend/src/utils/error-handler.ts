import i18n from 'i18next'
import axios from 'axios'
import toast from 'react-hot-toast'

type ApiErrorBody = {
  message?: string
  Message?: string
  errors?: Record<string, string[] | string>
}

export const getApiErrorMessage = (
  error: unknown,
  fallback?: string
): string => {
  const msg = tryExtractApiError(error)
  return msg || fallback || i18n.t('common.error')
}

function tryExtractApiError(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | string | undefined
    if (typeof data === 'string' && data.trim()) return data.trim()
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
  return null
}

export const handleApiError = (error: unknown, defaultMessage?: string) => {
  const message = getApiErrorMessage(error)
  toast.error(
    message || defaultMessage || i18n.t('message.error.serverConnection')
  )
  return message
}
