import { apiClient } from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { ApiResponse } from '@/types/common'

export interface LoginResult {
  token: string
}

export const login = async (payload: {
  email: string
  password: string
  rememberMe: boolean
}): Promise<string> => {
  const response = await apiClient.post<ApiResponse<string>>(
    API_ENDPOINTS.auth.login,
    payload
  )
  return response.data.data
}

export const register = async (payload: {
  fullName: string
  email: string
  phone: string
  password: string
}): Promise<string> => {
  const response = await apiClient.post<ApiResponse<string>>(
    API_ENDPOINTS.auth.register,
    payload
  )
  return response.data.data
}

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(
    API_ENDPOINTS.auth.forgotPassword,
    {
      email
    }
  )
  return response.data
}

export const resetPassword = async (payload: {
  email: string
  token: string
  newPassword: string
}): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(
    API_ENDPOINTS.auth.resetPassword,
    payload
  )
  return response.data
}

export const changePassword = async (payload: {
  currentPassword: string
  newPassword: string
}): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(
    API_ENDPOINTS.account.changePassword,
    payload
  )
  return response.data
}

export const verifyOtp = async (payload: {
  email: string
  otpCode: string
}): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(
    API_ENDPOINTS.auth.verifyOtp,
    payload
  )
  return response.data
}

export const resendOtp = async (payload: {
  email: string
}): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(
    API_ENDPOINTS.auth.resendOtp,
    payload
  )
  return response.data
}
