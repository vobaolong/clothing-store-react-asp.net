import { Button, Card, Checkbox, Form, Input, Radio, Select, Tag } from 'antd'
import { Controller } from 'react-hook-form'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { CheckoutSectionTitle } from '@/components/checkout/CheckoutSectionTitle'
import { formatShippingAddress } from '@/utils/checkout-utils'
import { QUERY_KEYS } from '@/constants/query-keys'
import toast from 'react-hot-toast'
import { setDefaultShippingAddress } from '@/api/addresses-api'
import { SHIPPING_ADDRESS_LABEL_OPTIONS } from '@/enums/shipping-address.enum'

import type {
  ShippingAddressesQuery,
  AddressState,
  CheckoutFormValues,
  SelectOption,
} from '@/types/checkout.type'
import type { QueryClient } from '@tanstack/react-query'

type Props = {
  control: Control<CheckoutFormValues>
  setValue: UseFormSetValue<CheckoutFormValues>
  addressesQuery: ShippingAddressesQuery
  addressState: AddressState
  provincesOptions: SelectOption[]
  wardOptions: SelectOption[]
  onToggleNewForm: () => void
  handleSaveNewAddress: () => Promise<void>
  qc: QueryClient
}

export default function ShippingAddressSection({
  control,
  setValue,
  addressesQuery,
  addressState,
  provincesOptions,
  wardOptions,
  onToggleNewForm,
  handleSaveNewAddress,
  qc,
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
                                queryKey: QUERY_KEYS.shippingAddresses,
                              })
                              toast.success('Đã đặt làm mặc định')
                            }}
                          >
                            Đặt làm mặc định
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
              <p className='mb-4 text-sm font-medium text-slate-700'>
                Địa chỉ mới
              </p>

              <div className='grid grid-cols-2 gap-x-4'>
                <Form.Item label='Họ và tên' required className='mb-3'>
                  <Controller
                    name='fullName'
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder='Nhập họ và tên' />
                    )}
                  />
                </Form.Item>
                <Form.Item label='Số điện thoại' required className='mb-3'>
                  <Controller
                    name='phone'
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder='Nhập số điện thoại' />
                    )}
                  />
                </Form.Item>
              </div>

              <div className='grid grid-cols-2 gap-x-4'>
                <Form.Item label='Tỉnh / Thành phố' required className='mb-3'>
                  <Controller
                    name='province'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '')
                            .toString()
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder='Chọn tỉnh / thành phố'
                        options={provincesOptions}
                        onChange={(val) => {
                          field.onChange(val)
                          setValue('ward', '')
                        }}
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item label='Phường / Xã' required className='mb-3'>
                  <Controller
                    name='ward'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '')
                            .toString()
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder='Phường / Xã'
                        options={wardOptions}
                      />
                    )}
                  />
                </Form.Item>
              </div>

              <Form.Item label='Địa chỉ cụ thể' required className='mb-3'>
                <Controller
                  name='street'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder='Số nhà, tên đường...' />
                  )}
                />
              </Form.Item>

              <div className='grid grid-cols-2 gap-x-4'>
                <Form.Item label='Nhãn' className='mb-3'>
                  <Controller
                    name='label'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        placeholder='Chọn nhãn'
                        options={SHIPPING_ADDRESS_LABEL_OPTIONS.map((o) => ({
                          label: o.label,
                          value: o.value,
                        }))}
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item className='mt-8 mb-3'>
                  <Controller
                    name='setAsDefault'
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      >
                        Đặt làm mặc định
                      </Checkbox>
                    )}
                  />
                </Form.Item>
              </div>

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
