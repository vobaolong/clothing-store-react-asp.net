import { Button, Card, Form, Radio, Tag } from 'antd'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { CheckoutSectionTitle } from '@/features/checkout/components/checkout-section-title'
import { formatShippingAddress } from '@/utils/checkout-utils'
import { QUERY_KEYS } from '@/constants/query-keys'
import toast from 'react-hot-toast'
import { setDefaultShippingAddress } from '@/api/addresses-api'

import type {
  ShippingAddressesQuery,
  AddressState,
  CheckoutFormValues
} from '@/features/checkout/types'
import type { QueryClient } from '@tanstack/react-query'

type Props = {
  control: Control<CheckoutFormValues>
  addressesQuery: ShippingAddressesQuery
  addressState: AddressState
  onToggleNewForm: () => void
  handleSaveNewAddress: () => Promise<void>
  qc: QueryClient
}

export default function ShippingAddressSection({
  control,
  addressesQuery,
  addressState,
  onToggleNewForm,
  handleSaveNewAddress,
  qc
}: Props) {
  return (
    <>
      <Card className='shadow-sm rounded-2xl border-slate-200'>
        <CheckoutSectionTitle step={1} title='Địa chỉ giao hàng' />
        <Form layout='vertical'>
          <Form.Item className='mb-3!'>
            <Controller
              name='shippingAddressId'
              control={control}
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  className='w-full'
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <div className='space-y-2'>
                    {(addressesQuery.data ?? []).map((addressItem) => (
                      <div
                        key={addressItem.id}
                        className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl transition-colors cursor-pointer ${
                          field.value === addressItem.id
                            ? 'border-red-500 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Radio value={addressItem.id}>
                          <div className='ml-1 text-sm'>
                            <p className='font-medium text-slate-900'>
                              {addressItem.fullName}
                              <span className='ml-2 font-normal text-slate-500'>
                                {addressItem.phone}
                              </span>
                            </p>
                            <p className='mt-0.5 text-slate-500'>
                              {formatShippingAddress(addressItem)}
                            </p>
                          </div>
                        </Radio>
                        {addressItem.isDefault ? (
                          <Tag color='green' className='shrink-0'>
                            Mặc định
                          </Tag>
                        ) : (
                          <Button
                            size='small'
                            className='shrink-0'
                            onClick={async () => {
                              await setDefaultShippingAddress(addressItem.id)
                              await qc.invalidateQueries({
                                queryKey: QUERY_KEYS.shippingAddresses
                              })
                              toast.success('Đã đặt làm địa chỉ mặc định')
                            }}
                          >
                            Đặt làm địa chỉ mặc định
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Radio.Group>
              )}
            />
          </Form.Item>

          <Button
            type='dashed'
            className='rounded-lg!'
            onClick={onToggleNewForm}
          >
            {addressState.showNewForm ? '✕ Đóng' : '+ Thêm địa chỉ mới'}
          </Button>

          {addressState.showNewForm && (
            <div className='pt-5 mt-5 space-y-0 border-t border-slate-100'>
              {/* ... keep internal new address form markup minimal here by reusing the parent form */}
              <p className='mb-4 text-sm font-medium text-slate-700'>
                Địa chỉ mới
              </p>
              {/* For brevity, parent continues to manage the detailed inputs */}
              <Button
                onClick={handleSaveNewAddress}
                type='default'
                className='rounded-lg!'
              >
                Lưu địa chỉ
              </Button>
            </div>
          )}
        </Form>
      </Card>
    </>
  )
}
