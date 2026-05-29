import { useState } from 'react'
import { Button, Card, Empty, Table, Tooltip } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getShippingAddresses,
  deleteShippingAddress,
  setDefaultShippingAddress
} from '@/api/addresses-api'

import { QUERY_KEYS } from '@/constants/query-keys'
import type { ShippingAddress } from '@/types'
import toast from 'react-hot-toast'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import ShippingAddressFormModal from '@/components/profile/ShippingAddressFormModal'
import { SHIPPING_ADDRESS_LABEL_OPTIONS } from '@/enums'

export default function AddressList() {
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
      toast.success('Đã xóa địa chỉ')
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
        <h1 className="text-2xl font-medium">Sổ Địa Chỉ</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditingAddress(null)
            setOpen(true)
          }}
        >
          Thêm địa chỉ mới
        </Button>
      </div>
      <div className="py-6 divide-y divide-slate-200">
        {(!data || data.length === 0) && !isLoading ? (
          <Empty description="Không có địa chỉ nào" />
        ) : (
          <Table
            rowKey="id"
            loading={isLoading}
            dataSource={data ?? []}
            bordered
            scroll={{ x: 'max-content' }}
            columns={[
              { title: 'Họ và tên', dataIndex: 'fullName' },
              {
                title: 'Địa chỉ',
                dataIndex: 'fullAddress',
                render: (_, row: ShippingAddress) => (
                  <div className="flex flex-col w-full gap-2">
                    <span className="flex items-center gap-2">
                      <strong>
                        {
                          SHIPPING_ADDRESS_LABEL_OPTIONS.find(
                            (x) => x.value === row.label
                          )?.label
                        }
                      </strong>
                      -
                      {row.isDefault ? (
                        <span className="px-1 font-medium text-green-500 border border-green-500 rounded-md w-fit">
                          Mặc định
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
                          Đặt làm mặc định
                        </Button>
                      )}
                    </span>
                    {row.fullAddress}
                  </div>
                )
              },
              {
                title: 'Số điện thoại',
                dataIndex: 'phone',
                width: 150
              },

              {
                title: 'Thao tác',
                align: 'center',
                fixed: 'right',
                width: 100,
                render: (_value, row: ShippingAddress) => (
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip title="Chỉnh sửa địa chỉ">
                      <Button
                        onClick={() => {
                          setEditingAddress(row)
                          setOpen(true)
                        }}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa địa chỉ">
                      <Button
                        danger
                        loading={deleteAddressMutation.isPending}
                        onClick={async () => {
                          await deleteAddressMutation.mutateAsync(row.id)
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
