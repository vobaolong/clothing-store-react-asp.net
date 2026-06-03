import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type {
  ShippingAddress,
  CreateShippingAddressPayload,
  UpdateShippingAddressPayload
} from '@/types'

export const getShippingAddresses = async (): Promise<ShippingAddress[]> =>
  apiData(apiClient.get(API_ENDPOINTS.account.shippingAddresses))

export const createShippingAddress = async (
  payload: CreateShippingAddressPayload
): Promise<string> =>
  apiData(apiClient.post(API_ENDPOINTS.account.shippingAddresses, payload))

export const updateShippingAddress = async (
  id: string,
  payload: UpdateShippingAddressPayload
): Promise<void> =>
  apiVoid(apiClient.put(API_ENDPOINTS.account.shippingAddressById(id), payload))

export const deleteShippingAddress = async (id: string): Promise<void> =>
  apiVoid(apiClient.delete(API_ENDPOINTS.account.shippingAddressById(id)))

export const getShippingAddressPrefill = async (): Promise<{
  fullName?: string
  email?: string
  phone?: string
}> => apiData(apiClient.get(API_ENDPOINTS.account.shippingAddressPrefill))

export const setDefaultShippingAddress = async (id: string): Promise<void> =>
  apiVoid(apiClient.put(API_ENDPOINTS.account.shippingAddressDefaultById(id)))
