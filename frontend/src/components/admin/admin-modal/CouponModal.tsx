import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createCoupon, updateCoupon } from '@/api/coupons-api'
import { CouponDiscountType, CouponStatus } from '@/enums'
import type { Coupon } from '@/types'
import axios from 'axios'

type Props = {
  open: boolean
  editing: Coupon | null
  onDirty: () => void
  onClose: () => void
  onSaved: () => void
}

interface CouponFormValues {
  code: string
  discountType: CouponDiscountType
  discountAmount: number
  minOrderSubtotal: number
  maxUsage: number
  startsAt?: dayjs.Dayjs | null
  expiresAt: dayjs.Dayjs
  status: CouponStatus
}

function CouponModal({ open, editing, onDirty, onClose, onSaved }: Props) {
  const [form] = Form.useForm<CouponFormValues>()
  const [isSaving, setIsSaving] = useState(false)

  const discountType =
    Form.useWatch('discountType', form) ?? CouponDiscountType.FLAT
  const isPercent = discountType === CouponDiscountType.PERCENT

  useEffect(() => {
    if (open) {
      form.resetFields()
      form.setFieldsValue(
        editing
          ? {
              ...editing,
              startsAt: editing.startsAt ? dayjs(editing.startsAt) : undefined,
              expiresAt: dayjs(editing.expiresAt)
            }
          : {
              status: CouponStatus.ACTIVE,
              minOrderSubtotal: 0,
              discountType: CouponDiscountType.FLAT
            }
      )
    }
  }, [open, editing, form])

  const handleValuesChange = (changedValues: Partial<CouponFormValues>) => {
    onDirty()
    if (changedValues.discountType) {
      form.setFieldValue('discountAmount', null)
    }
  }

  const save = async () => {
    try {
      const values = await form.validateFields()
      setIsSaving(true)

      const payload = {
        code: values.code.trim(),
        discountType: values.discountType,
        discountAmount: values.discountAmount,
        minOrderSubtotal: values.minOrderSubtotal,
        maxUsage: values.maxUsage,
        startsAt: values.startsAt?.toISOString() ?? null,
        expiresAt: values.expiresAt.toISOString(),
        status: values.status
      }

      if (editing) {
        await updateCoupon(editing.id, payload)
      } else {
        await createCoupon(payload)
      }

      toast.success(editing ? 'Đã cập nhật Voucher' : 'Đã tạo Voucher')
      onSaved()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra từ server')
      } else if (!(err instanceof Error && 'errorFields' in err)) {
        toast.error('Có lỗi xảy ra trong quá trình lưu')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      title={editing ? 'Cập nhật Voucher' : 'Tạo Voucher'}
      open={open}
      forceRender
      onOk={save}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ loading: isSaving, disabled: isSaving }}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item
          name="code"
          label="Mã Voucher"
          rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
        >
          <Input placeholder="Ví dụ: TET2026" />
        </Form.Item>

        <Form.Item
          name="discountType"
          label="Loại giảm giá"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'Số tiền cố định', value: CouponDiscountType.FLAT },
              { label: 'Phần trăm', value: CouponDiscountType.PERCENT }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="discountAmount"
          label={isPercent ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VND)'}
          rules={[
            { required: true, message: 'Vui lòng nhập giá trị giảm' },
            {
              type: 'number',
              min: isPercent ? 1 : 0,
              max: isPercent ? 100 : undefined,
              message: isPercent
                ? 'Phần trăm giảm giá phải từ 1 đến 100'
                : 'Số tiền giảm giá phải lớn hơn hoặc bằng 0'
            }
          ]}
        >
          <InputNumber precision={0} className="w-full!" />
        </Form.Item>

        <Form.Item
          name="minOrderSubtotal"
          label="Đơn tối thiểu (VND)"
          rules={[
            { required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' }
          ]}
        >
          <InputNumber min={0} className="w-full!" />
        </Form.Item>

        <Form.Item
          name="maxUsage"
          label="Số lượt dùng tối đa"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượt dùng tối đa' }
          ]}
        >
          <InputNumber min={1} precision={0} className="w-full!" />
        </Form.Item>

        <Form.Item
          name="startsAt"
          label="Ngày bắt đầu (Tùy chọn)"
          extra="Để trống nếu muốn áp dụng ngay lập tức."
        >
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="HH:mm:ss DD/MM/YYYY"
            className="w-full"
            allowClear
            placeholder="Chọn ngày bắt đầu"
          />
        </Form.Item>

        <Form.Item
          name="expiresAt"
          label="Ngày hết hạn"
          rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="HH:mm:ss DD/MM/YYYY"
            className="w-full"
            placeholder="Chọn ngày hết hạn"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'Hoạt động', value: CouponStatus.ACTIVE },
              { label: 'Không hoạt động', value: CouponStatus.INACTIVE },
              { label: 'Lưu trữ (Archived)', value: CouponStatus.ARCHIVED }
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CouponModal
