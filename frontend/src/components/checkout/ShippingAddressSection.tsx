import { Button, Card, Form, Radio, Tag } from 'antd'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { CheckoutSectionTitle } from '@/components/checkout/CheckoutSectionTitle'
import { formatShippingAddress } from '@/utils/checkout-utils'
import { QUERY_KEYS } from '@/constants/query-keys'
import toast from 'react-hot-toast'
import { setDefaultShippingAddress } from '@/api/addresses-api'
import { EditOutlined } from '@ant-design/icons'

import type {
  ShippingAddressesQuery,
  CheckoutFormValues
} from '@/types/checkout.type'
import type { ShippingAddress } from '@/types'
import type { QueryClient } from '@tanstack/react-query'
import { ShippingAddressType } from '@/enums'

type Props = {
  control: Control<CheckoutFormValues>
  addressesQuery: ShippingAddressesQuery
  onOpenModal: () => void
  onEditAddress: (address: ShippingAddress) => void
  qc: QueryClient
}

export default function ShippingAddressSection({
  control,
  addressesQuery,
  onOpenModal,
  onEditAddress,
  qc
}: Props) {
  return (
    <>
      <Card className='rounded-2xl border-slate-200'>
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
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Radio value={addressItem.id}>
                          <div className='ml-1 text-sm'>
                            <p className='flex gap-2 font-medium text-slate-900'>
                              {addressItem.fullName}
                              <span className='font-normal text-slate-700'>
                                {addressItem.phone}
                              </span>
                              <Tag color='blue'>
                                {ShippingAddressType[
                                  addressItem.label?.toUpperCase() as keyof typeof ShippingAddressType
                                ] || '—'}
                              </Tag>
                            </p>
                            <p className='mt-0.5 text-slate-500'>
                              {formatShippingAddress(addressItem)}
                            </p>
                          </div>
                        </Radio>
                        <div className='gap-3 flex flex-col items-end!'>
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
                                toast.success('Đã đặt làm mặc định')
                              }}
                            >
                              Đặt làm mặc định
                            </Button>
                          )}
                          <Button
                            size='small'
                            type='text'
                            icon={<EditOutlined />}
                            onClick={() => onEditAddress(addressItem)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Radio.Group>
              )}
            />
          </Form.Item>

          <Button onClick={onOpenModal}>+ Thêm địa chỉ mới</Button>
        </Form>
      </Card>
    </>
  )
}
