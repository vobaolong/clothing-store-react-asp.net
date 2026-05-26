import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Empty,
  Modal,
  Table,
  Tag,
  Form,
  Input,
  Tooltip,
  Select,
  Switch,
  Divider
} from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getShippingAddresses,
  createShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress
} from '@/api/addresses-api'
import { getProvinces, getWardsByProvinceId } from '@/api/provinces-api'
import {
  ShippingAddressLabel,
  ShippingAddressType
} from '@/enums/shipping-address.enum'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { ShippingAddress, UpdateShippingAddressPayload } from '@/types'
import toast from 'react-hot-toast'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

interface LabelSelectorProps {
  value?: ShippingAddressLabel
  onChange?: (val?: ShippingAddressLabel) => void
}

const LabelSelector = ({ value, onChange }: LabelSelectorProps) => {
  return (
    <div className='flex gap-2'>
      <Button
        type={value === ShippingAddressLabel.HOME ? 'primary' : 'default'}
        onClick={() =>
          onChange?.(
            value === ShippingAddressLabel.HOME
              ? undefined
              : ShippingAddressLabel.HOME
          )
        }
      >
        Nhà riêng
      </Button>
      <Button
        type={value === ShippingAddressLabel.OFFICE ? 'primary' : 'default'}
        onClick={() =>
          onChange?.(
            value === ShippingAddressLabel.OFFICE
              ? undefined
              : ShippingAddressLabel.OFFICE
          )
        }
      >
        Văn phòng
      </Button>
    </div>
  )
}

export default function AddressList() {
  const [open, setOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null
  )
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.shippingAddresses,
    queryFn: getShippingAddresses
  })

  const selectedProvinceId = Form.useWatch('province', form)

  const provincesQuery = useQuery({
    queryKey: QUERY_KEYS.checkoutProvinces,
    queryFn: () => getProvinces()
  })

  const wardsByProvinceQuery = useQuery({
    queryKey: QUERY_KEYS.checkoutWardsByProvince(selectedProvinceId),
    queryFn: () => getWardsByProvinceId(String(selectedProvinceId)),
    enabled: Boolean(selectedProvinceId)
  })

  const provincesOptions =
    provincesQuery.data?.map((p) => ({
      label: p.name,
      value: p.code
    })) ?? []

  const wardOptions =
    wardsByProvinceQuery.data?.map((w) => ({
      label: w.name,
      value: w.code
    })) ?? []

  const refreshAddresses = async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.shippingAddresses
    })
  }

  const createAddressMutation = useMutation({
    mutationFn: createShippingAddress,
    onSuccess: async () => {
      toast.success('Đã thêm địa chỉ mới')
      setOpen(false)
      form.resetFields()
      await refreshAddresses()
    }
  })

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

  const updateAddressMutation = useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string
      payload: UpdateShippingAddressPayload
    }) => updateShippingAddress(id, payload),
    onSuccess: async () => {
      toast.success('Đã cập nhật địa chỉ')
      setOpen(false)
      setEditingAddress(null)
      form.resetFields()
      await refreshAddresses()
    }
  })

  useEffect(() => {
    if (editingAddress) {
      form.setFieldsValue({
        fullName: editingAddress.fullName,
        phone: editingAddress.phone,
        province: editingAddress.provinceId,
        ward: editingAddress.wardCode,
        street: editingAddress.street,
        label: editingAddress.label || undefined,
        isDefault: editingAddress.isDefault
      })
    } else {
      form.resetFields()
    }
  }, [editingAddress, form])

  return (
    <Card>
      <div className='flex justify-between items-center mb-3'>
        <h1 className='text-2xl font-medium'>Sổ Địa Chỉ</h1>
        <Button
          type='primary'
          onClick={() => {
            setEditingAddress(null)
            setOpen(true)
          }}
        >
          Thêm địa chỉ mới
        </Button>
      </div>
      <Divider />
      {(!data || data.length === 0) && !isLoading ? (
        <Empty description='Không có địa chỉ nào' />
      ) : (
        <Table
          rowKey='id'
          loading={isLoading}
          dataSource={data}
          scroll={{ x: 'max-content' }}
          bordered
          columns={[
            { title: 'Họ và tên', dataIndex: 'fullName' },
            {
              title: 'Địa chỉ',
              render: (_value, row: ShippingAddress) => (
                <div className='flex flex-col gap-2'>
                  <div className='flex gap-2 items-center'>
                    <strong>
                      {row.label === ShippingAddressLabel.HOME &&
                        ShippingAddressType.HOME}
                      {row.label === ShippingAddressLabel.OFFICE &&
                        ShippingAddressType.OFFICE}
                    </strong>
                    -
                    {row.isDefault ? (
                      <Tag className='w-fit' color='green'>
                        Mặc định
                      </Tag>
                    ) : (
                      <Button
                        loading={setDefaultAddressMutation.isPending}
                        onClick={async () => {
                          await setDefaultAddressMutation.mutateAsync(row.id)
                        }}
                      >
                        Đặt làm mặc định
                      </Button>
                    )}
                  </div>
                  {row.fullAddress}
                </div>
              )
            },
            { title: 'Số điện thoại', dataIndex: 'phone' },

            {
              title: 'Thao tác',
              fixed: 'right',
              width: 150,
              align: 'center',
              render: (_value, row: ShippingAddress) => (
                <div className='flex gap-2 justify-center'>
                  <Tooltip title='Chỉnh sửa địa chỉ'>
                    <Button
                      onClick={() => {
                        setEditingAddress(row)
                        setOpen(true)
                      }}
                      icon={<EditOutlined />}
                    />
                  </Tooltip>
                  <Tooltip title='Xóa địa chỉ'>
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

      <Modal
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={open}
        onCancel={() => {
          setOpen(false)
          setEditingAddress(null)
        }}
        onOk={async () => {
          const values = await form.validateFields()
          const provinceId = values.province
          const wardCode = values.ward
          const street = values.street

          const provinceName =
            provincesQuery.data?.find((x) => x.code === provinceId)?.name ?? ''
          const wardName =
            wardsByProvinceQuery.data?.find((x) => x.code === wardCode)?.name ??
            ''
          const addressStr = [street, wardName, provinceName]
            .filter(Boolean)
            .join(', ')

          const payload: UpdateShippingAddressPayload = {
            fullName: values.fullName,
            phone: values.phone,
            address: addressStr,
            province: provinceName,
            provinceId: provinceId,
            ward: wardName,
            wardCode,
            street,
            label: values.label,
            isDefault: Boolean(values.isDefault)
          }

          if (editingAddress) {
            await updateAddressMutation.mutateAsync({
              id: editingAddress.id,
              payload
            })
          } else {
            await createAddressMutation.mutateAsync(payload)
          }
        }}
        confirmLoading={
          createAddressMutation.isPending || updateAddressMutation.isPending
        }
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='fullName'
            label='Họ và tên'
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder='Nhập họ và tên' />
          </Form.Item>
          <Form.Item
            name='phone'
            label='Số điện thoại'
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder='Nhập số điện thoại' />
          </Form.Item>
          <Form.Item
            name='province'
            label='Tỉnh / Thành phố'
            rules={[
              { required: true, message: 'Vui lòng chọn tỉnh / thành phố' }
            ]}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder='Chọn tỉnh / thành phố'
              options={provincesOptions}
              loading={provincesQuery.isLoading}
              onChange={() => {
                form.setFieldValue('ward', undefined)
              }}
            />
          </Form.Item>
          <Form.Item
            name='ward'
            label='Phường / Xã'
            rules={[{ required: true, message: 'Vui lòng chọn phường / xã' }]}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder='Chọn phường / xã'
              options={wardOptions}
              loading={wardsByProvinceQuery.isLoading}
              disabled={!selectedProvinceId}
            />
          </Form.Item>
          <Form.Item
            name='street'
            label='Địa chỉ cụ thể'
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }
            ]}
          >
            <Input placeholder='Số nhà, tên đường...' />
          </Form.Item>
          <Form.Item name='label' label='Nhãn'>
            <LabelSelector />
          </Form.Item>
          <Form.Item
            name='isDefault'
            label='Đặt làm mặc định'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
