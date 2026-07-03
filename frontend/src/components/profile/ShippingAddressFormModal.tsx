import { useEffect, useRef } from 'react'
import { Button, Checkbox, Form, Input, Modal, Select, Tag } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createShippingAddress,
  updateShippingAddress
} from '@/api/addresses-api'
import { getProvinces, getWardsByProvinceId } from '@/api/provinces-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { ShippingAddressLabel } from '@/enums/shipping-address.enum'
import { SHIPPING_ADDRESS_LABEL_OPTIONS } from '@/options/shipping-address.options'
import type { CreateShippingAddressPayload, ShippingAddress } from '@/types'
import { useTranslation } from 'react-i18next'

type ShippingAddressFormValues = {
  fullName?: string
  phone?: string
  province?: string
  ward?: string
  street?: string
  label?: ShippingAddressLabel
  isDefault?: boolean
}

type Props = {
  open: boolean
  onCancel: () => void
  address?: ShippingAddress | null
  onSaved?: (addressId: string) => void | Promise<void>
}

export default function ShippingAddressFormModal({
  open,
  onCancel,
  address,
  onSaved
}: Props) {
  const [form] = Form.useForm<ShippingAddressFormValues>()
  const queryClient = useQueryClient()
  const previousProvinceIdRef = useRef<string | undefined>(undefined)
  const isEditMode = Boolean(address)
  const { t } = useTranslation()
  const provincesQuery = useQuery({
    queryKey: QUERY_KEYS.checkoutProvinces,
    queryFn: () => getProvinces(),
    enabled: open
  })

  const selectedProvinceId = Form.useWatch('province', form)
  const selectedLabel = Form.useWatch('label', form)

  const wardsQuery = useQuery({
    queryKey: QUERY_KEYS.checkoutWardsByProvince(selectedProvinceId),
    queryFn: () => getWardsByProvinceId(String(selectedProvinceId)),
    enabled: Boolean(open && selectedProvinceId)
  })

  useEffect(() => {
    if (!open) {
      form.resetFields()
      previousProvinceIdRef.current = undefined
      return
    }

    if (address) {
      form.setFieldsValue({
        fullName: address.fullName,
        phone: address.phone,
        province: address.provinceId,
        ward: address.wardCode,
        street: address.street,
        label: address.label ?? undefined,
        isDefault: address.isDefault
      })
    } else {
      form.setFieldsValue({ label: SHIPPING_ADDRESS_LABEL_OPTIONS[0].value })
    }
  }, [address, form, open])

  useEffect(() => {
    if (!open) return

    if (!previousProvinceIdRef.current) {
      previousProvinceIdRef.current = selectedProvinceId
      return
    }

    if (
      previousProvinceIdRef.current &&
      selectedProvinceId &&
      previousProvinceIdRef.current !== selectedProvinceId
    ) {
      form.setFieldValue('ward', undefined)
    }

    previousProvinceIdRef.current = selectedProvinceId
  }, [form, open, selectedProvinceId])

  const createAddressMutation = useMutation({
    mutationFn: createShippingAddress,
    onSuccess: async (addressId) => {
      toast.success('Đã thêm địa chỉ mới')
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.shippingAddresses
      })
      form.resetFields()
      await onSaved?.(addressId)
      onCancel()
    }
  })

  const updateAddressMutation = useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string
      payload: CreateShippingAddressPayload
    }) => updateShippingAddress(id, payload),
    onSuccess: async (_, variables) => {
      toast.success('Đã cập nhật địa chỉ')
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.shippingAddresses
      })
      form.resetFields()
      await onSaved?.(variables.id)
      onCancel()
    }
  })

  const handleFinish = async (values: ShippingAddressFormValues) => {
    const fullName = values.fullName?.trim() ?? ''
    const phone = values.phone?.trim() ?? ''
    const provinceId = values.province?.trim() ?? ''
    const wardCode = values.ward?.trim() ?? ''
    const street = values.street?.trim() ?? ''

    const provinceName =
      provincesQuery.data?.find((x) => x.code === provinceId)?.name ?? ''
    const wardName =
      wardsQuery.data?.find(
        (x: { name: string; code: string }) => x.code === wardCode
      )?.name ?? ''
    if (!fullName || !phone || !provinceId || !wardCode || !street) {
      toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ')
      return
    }

    const payload: CreateShippingAddressPayload = {
      fullName,
      phone,
      province: provinceName,
      provinceId: provinceId,
      ward: wardName,
      wardCode,
      street,
      label: values.label ?? SHIPPING_ADDRESS_LABEL_OPTIONS[0].value,
      isDefault: Boolean(values.isDefault)
    }

    if (address) {
      await updateAddressMutation.mutateAsync({ id: address.id, payload })
      return
    }

    await createAddressMutation.mutateAsync(payload)
  }

  return (
    <Modal
      title={isEditMode ? t('profile.editAddress') : t('profile.addAddress')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={
        createAddressMutation.isPending || updateAddressMutation.isPending
      }
      okText={isEditMode ? t('profile.editAddress') : t('profile.saveAddress')}
      cancelText={t('common.cancel')}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="fullName"
          label={t('profile.fullName')}
          rules={[{ required: true, message: t('profile.fullNameRequired') }]}
        >
          <Input placeholder={t('profile.fullName')} />
        </Form.Item>

        <Form.Item
          name="phone"
          label={t('profile.phone')}
          rules={[{ required: true, message: t('profile.phoneRequired') }]}
        >
          <Input placeholder={t('profile.phone')} />
        </Form.Item>

        <Form.Item
          name="province"
          label={t('profile.province')}
          rules={[{ required: true, message: t('profile.provinceRequired') }]}
        >
          <Select
            showSearch
            placeholder={t('profile.province')}
            options={(provincesQuery.data ?? []).map((item) => ({
              label: item.name,
              value: item.code
            }))}
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="ward"
          label={t('profile.ward')}
          rules={[{ required: true, message: t('profile.wardRequired') }]}
        >
          <Select
            showSearch
            disabled={!selectedProvinceId}
            placeholder={t('profile.ward')}
            options={(wardsQuery.data ?? []).map(
              (item: { name: string; code: string }) => ({
                label: item.name,
                value: item.code
              })
            )}
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="street"
          label={t('profile.street')}
          required
          rules={[{ required: true, message: t('profile.streetRequired') }]}
        >
          <Input placeholder={t('profile.street')} />
        </Form.Item>

        <Form.Item name="label" label={t('profile.addressLabel')}>
          <div className="flex flex-wrap gap-2">
            {SHIPPING_ADDRESS_LABEL_OPTIONS.map((item) => (
              <Tag.CheckableTag
                key={item.value}
                checked={selectedLabel === item.value}
                onChange={(checked) => {
                  form.setFieldValue(
                    'label',
                    checked
                      ? item.value
                      : SHIPPING_ADDRESS_LABEL_OPTIONS[0].value
                  )
                }}
                className="flex! items-center! justify-center! px-3 py-1.5 h-8! text-sm leading-none border cursor-pointer border-slate-300!"
              >
                {t(item.labelKey)}
              </Tag.CheckableTag>
            ))}
          </div>
        </Form.Item>

        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>{t('profile.setDefaultAddress')}</Checkbox>
        </Form.Item>

        <div className="hidden">
          <Button htmlType="submit">{t('common.save')}</Button>
        </div>
      </Form>
    </Modal>
  )
}
