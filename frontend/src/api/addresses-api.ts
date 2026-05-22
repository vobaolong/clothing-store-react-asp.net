import { apiClient } from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints'
import type {
  ShippingAddress,
  CreateShippingAddressPayload,
  UpdateShippingAddressPayload
} from '@/types'

export const getShippingAddresses = async (): Promise<ShippingAddress[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.account.shippingAddresses)
  return data.data
}

export const createShippingAddress = async (
  payload: CreateShippingAddressPayload
): Promise<string> => {
  const { data } = await apiClient.post(
    API_ENDPOINTS.account.shippingAddresses,
    payload
  )
  return data.data as string
}

export const updateShippingAddress = async (
  id: string,
  payload: UpdateShippingAddressPayload
) => apiClient.put(API_ENDPOINTS.account.shippingAddressById(id), payload)

export const deleteShippingAddress = async (id: string) =>
  apiClient.delete(API_ENDPOINTS.account.shippingAddressById(id))

export const getShippingAddressPrefill = async (): Promise<{
  fullName?: string
  email?: string
  phone?: string
}> => {
  const { data } = await apiClient.get(
    `${API_ENDPOINTS.account.shippingAddresses}/prefill`
  )
  return data.data
}

export const setDefaultShippingAddress = async (id: string) =>
  apiClient.put(API_ENDPOINTS.account.shippingAddressDefaultById(id))
