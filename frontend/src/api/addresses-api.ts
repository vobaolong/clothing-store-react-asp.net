import { apiClient, apiData, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type {
  ShippingAddress,
  CreateShippingAddressPayload,
  UpdateShippingAddressPayload
} from '@/types'

// GET api/account/shipping-addresses
export const getShippingAddresses = async (): Promise<ShippingAddress[]> =>
  apiData(apiClient.get(API_ENDPOINTS.account.shippingAddresses))

// POST api/account/shipping-addresses
export const createShippingAddress = async (
  payload: CreateShippingAddressPayload
): Promise<string> =>
  apiData(apiClient.post(API_ENDPOINTS.account.shippingAddresses, payload))

// PUT api/account/shipping-addresses/{id}
export const updateShippingAddress = async (
  id: string,
  payload: UpdateShippingAddressPayload
): Promise<void> =>
  apiVoid(apiClient.put(API_ENDPOINTS.account.shippingAddressById(id), payload))

// DELETE api/account/shipping-addresses/{id}
export const deleteShippingAddress = async (id: string): Promise<void> =>
  apiVoid(apiClient.delete(API_ENDPOINTS.account.shippingAddressById(id)))

// GET api/account/shipping-addresses/prefill
export const getShippingAddressPrefill = async (): Promise<{
  fullName: string
  email: string
  phone: string
}> => apiData(apiClient.get(API_ENDPOINTS.account.shippingAddressPrefill))

// PUT api/account/shipping-addresses/{id}/default
export const setDefaultShippingAddress = async (id: string): Promise<void> =>
  apiVoid(apiClient.put(API_ENDPOINTS.account.shippingAddressDefaultById(id)))
