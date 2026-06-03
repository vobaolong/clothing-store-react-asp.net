import { useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { UseFormSetValue } from 'react-hook-form'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import type { ShippingAddress } from '@/types'
import type { CheckoutFormValues } from '@/types/checkout.type'

type Params = {
  queryClient: QueryClient
  setValue: UseFormSetValue<CheckoutFormValues>
}

export function useCheckoutAddressModalState({
  queryClient,
  setValue
}: Params) {
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null
  )
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  const handleOpenAddAddress = () => {
    setEditingAddress(null)
    setIsAddressModalOpen(true)
  }

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddress(address)
    setIsAddressModalOpen(true)
  }

  const handleCloseAddressModal = () => {
    setEditingAddress(null)
    setIsAddressModalOpen(false)
  }

  const handleAddressModalSaved = async (addressId: string) => {
    setValue('shippingAddressId', addressId)
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.shippingAddresses
    })
    handleCloseAddressModal()
  }

  return {
    editingAddress,
    isAddressModalOpen,
    handleOpenAddAddress,
    handleEditAddress,
    handleCloseAddressModal,
    handleAddressModalSaved
  }
}

export type CheckoutAddressModalState = ReturnType<
  typeof useCheckoutAddressModalState
>
