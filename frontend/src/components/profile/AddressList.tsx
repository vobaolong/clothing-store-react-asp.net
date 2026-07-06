import { useState } from 'react'
import { Button, Card, Empty, Modal, Table, Tooltip } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getShippingAddresses,
  deleteShippingAddress,
  setDefaultShippingAddress
} from '@/api/addresses-api'

import { QUERY_KEYS } from '@/constants/query-keys.constant'
import type { ShippingAddress } from '@/types'
import toast from 'react-hot-toast'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import ShippingAddressFormModal from '@/components/profile/ShippingAddressFormModal'
import { SHIPPING_ADDRESS_LABEL_OPTIONS } from '@/options/shipping-address.options'

export default function AddressList() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null
  )
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.shippingAddresses,
    queryFn: getShippingAddresses
  })

  const refreshAddresses = async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.shippingAddresses
    })
  }

  const deleteAddressMutation = useMutation({
    mutationFn: deleteShippingAddress,
    onSuccess: async () => {
      toast.success(t('profile.addressDeleted'))
      await refreshAddresses()
    }
  })

  const setDefaultAddressMutation = useMutation({
    mutationFn: setDefaultShippingAddress,
    onSuccess: async () => {
      await refreshAddresses()
    }
  })

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{t('profile.addressBook')}</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingAddress(null)
            setOpen(true)
          }}
        >
          {t('profile.addNewAddress')}
        </Button>
      </div>
      <div className="pt-6 divide-y divide-slate-200">
        {(!data || data.length === 0) && !isLoading ? (
          <Empty description={t('profile.noAddresses')} />
        ) : (
          <Table
            rowKey="id"
            loading={isLoading}
            dataSource={data ?? []}
            bordered
            scroll={{ x: 'max-content' }}
            columns={[
              { title: t('profile.fullName'), dataIndex: 'fullName' },
              {
                title: t('order.address'),
                dataIndex: 'fullAddress',
                render: (_, row: ShippingAddress) => (
                  <div className="flex flex-col w-full gap-2">
                    <span className="flex items-center gap-2">
                      <strong>
                        {(() => {
                          const labelKey = SHIPPING_ADDRESS_LABEL_OPTIONS.find(
                            (x) => x.value === row.label
                          )?.labelKey

                          return labelKey ? t(labelKey as never) : ''
                        })()}
                      </strong>
                      -
                      {row.isDefault ? (
                        <span className="px-1 font-medium text-green-500 border border-green-500 rounded-md w-fit">
                          {t('common.default')}
                        </span>
                      ) : (
                        <Button
                          type="primary"
                          className="p-0 w-fit!"
                          loading={setDefaultAddressMutation.isPending}
                          onClick={async () => {
                            await setDefaultAddressMutation.mutateAsync(row.id)
                          }}
                        >
                          {t('profile.setAsDefaultAction')}
                        </Button>
                      )}
                    </span>
                    {row.fullAddress}
                  </div>
                )
              },
              {
                title: t('profile.phone'),
                dataIndex: 'phone',
                width: 150
              },

              {
                title: t('common.action'),
                align: 'center',
                fixed: 'right',
                width: 100,
                render: (_value, row: ShippingAddress) => (
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip title={t('profile.tooltipEditAddress')}>
                      <Button
                        onClick={() => {
                          setEditingAddress(row)
                          setOpen(true)
                        }}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title={t('profile.tooltipDeleteAddress')}>
                      <Button
                        danger
                        loading={deleteAddressMutation.isPending}
                        onClick={async () => {
                          Modal.confirm({
                            title: t('profile.deleteAddressConfirmTitle'),
                            content: t('profile.deleteAddressIrreversible'),
                            onOk: () =>
                              deleteAddressMutation.mutateAsync(row.id)
                          })
                        }}
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </div>
                )
              }
            ]}
          />
        )}
      </div>

      <ShippingAddressFormModal
        open={open}
        address={editingAddress}
        onCancel={() => {
          setOpen(false)
          setEditingAddress(null)
        }}
        onSaved={async () => {
          await refreshAddresses()
        }}
      />
    </Card>
  )
}
