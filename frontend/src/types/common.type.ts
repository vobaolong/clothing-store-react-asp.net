export type DateFormatMode = 'dateTime' | 'dateOnly' | 'dateOnlyUTC'

export type Option = {
  value: string
  label: string
}

export type ColorOption = {
  color: string
  hex: string
}

export type QuantityMap = Record<string, number>

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}
