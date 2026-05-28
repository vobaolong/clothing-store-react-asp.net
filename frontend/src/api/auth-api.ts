import { apiClient, apiData, apiResponse } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type { ApiResponse } from '@/types/common.type'

export interface LoginResult {
  token: string
}

export const login = async (payload: {
  email: string
  password: string
  rememberMe: boolean
}): Promise<string> => {
  return apiData(apiClient.post(API_ENDPOINTS.auth.login, payload))
}

export const register = async (payload: {
  fullName: string
  email: string
  phone: string
  password: string
}): Promise<string> => {
  return apiData(apiClient.post(API_ENDPOINTS.auth.register, payload))
}

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  return apiResponse(
    apiClient.post(API_ENDPOINTS.auth.forgotPassword, {
      email
    })
  )
}

export const resetPassword = async (payload: {
  email: string
  token: string
  newPassword: string
}): Promise<ApiResponse> => {
  return apiResponse(apiClient.post(API_ENDPOINTS.auth.resetPassword, payload))
}

export const changePassword = async (payload: {
  currentPassword: string
  newPassword: string
}): Promise<ApiResponse> => {
  return apiResponse(
    apiClient.post(API_ENDPOINTS.account.changePassword, payload)
  )
}

export const verifyOtp = async (payload: {
  email: string
  otpCode: string
}): Promise<ApiResponse> => {
  return apiResponse(apiClient.post(API_ENDPOINTS.auth.verifyOtp, payload))
}

export const resendOtp = async (payload: {
  email: string
}): Promise<ApiResponse> => {
  return apiResponse(apiClient.post(API_ENDPOINTS.auth.resendOtp, payload))
}
