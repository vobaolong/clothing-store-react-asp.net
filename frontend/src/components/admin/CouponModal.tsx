import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'
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

function CouponModal({ open, editing, onDirty, onClose, onSaved }: Props) {
  const [form] = Form.useForm()
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

  const save = async () => {
    const values = await form.validateFields()
    const discountType = (values.discountType ??
      CouponDiscountType.FLAT) as CouponDiscountType
    const discountAmount = Number(values.discountAmount)
    const minOrderSubtotal = Number(values.minOrderSubtotal)
    const maxUsage = Math.trunc(Number(values.maxUsage))

    if (
      !Number.isFinite(discountAmount) ||
      !Number.isFinite(minOrderSubtotal) ||
      !Number.isFinite(maxUsage)
    ) {
      toast.error('Vui lòng nhập số hợp lệ')
      return
    }

    if (discountType === CouponDiscountType.PERCENT) {
      if (discountAmount <= 0 || discountAmount > 100) {
        toast.error('Phần trăm giảm giá phải từ 1 đến 100')
        return
      }
    } else if (discountAmount < 0) {
      toast.error('Số tiền giảm giá phải lớn hơn hoặc bằng 0')
      return
    }

    const payload = {
      code: String(values.code ?? '').trim(),
      discountType,
      discountAmount,
      minOrderSubtotal,
      maxUsage,
      startsAt: values.startsAt?.toISOString?.() ?? null,
      expiresAt: values.expiresAt.toISOString(),
      status: values.status as CouponStatus
    }

    try {
      if (editing) await updateCoupon(editing.id, payload)
      else await createCoupon(payload)
      toast.success(editing ? 'Đã cập nhật Voucher' : 'Đã tạo Voucher')
      onSaved()
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Có lỗi xảy ra'
      toast.error(message || 'Có lỗi xảy ra')
    }
  }

  return (
    <Modal
      title={editing ? 'Cập nhật Voucher' : 'Tạo Voucher'}
      open={open}
      forceRender
      onOk={save}
      onCancel={onClose}
      okText='Lưu'
      cancelText='Hủy'
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout='vertical' onValuesChange={onDirty}>
        <Form.Item
          name='code'
          label='Mã Voucher'
          rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
        >
          <Input placeholder='Ví dụ: TET2024' />
        </Form.Item>
        <Form.Item
          name='discountType'
          label='Loại giảm giá'
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
          name='discountAmount'
          label={isPercent ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VND)'}
          rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
        >
          <InputNumber
            min={isPercent ? 1 : 0}
            max={isPercent ? 100 : undefined}
            precision={0}
            className='w-full!'
          />
        </Form.Item>
        <Form.Item
          name='minOrderSubtotal'
          label='Đơn tối thiểu (VND)'
          rules={[{ required: true }]}
        >
          <InputNumber min={0} className='w-full!' />
        </Form.Item>
        <Form.Item
          name='maxUsage'
          label='Số lượt dùng tối đa'
          rules={[{ required: true }]}
        >
          <InputNumber min={1} precision={0} className='w-full!' />
        </Form.Item>
        <Form.Item
          name='startsAt'
          label='Ngày bắt đầu (Tùy chọn)'
          extra='Để trống nếu muốn áp dụng ngay lập tức.'
        >
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format='HH:mm:ss DD/MM/YYYY'
            className='w-full'
            allowClear
            placeholder='Chọn ngày bắt đầu'
          />
        </Form.Item>
        <Form.Item
          name='expiresAt'
          label='Ngày hết hạn'
          rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format='HH:mm:ss DD/MM/YYYY'
            className='w-full'
            placeholder='Chọn ngày hết hạn'
          />
        </Form.Item>
        <Form.Item
          name='status'
          label='Trạng thái'
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'Hoạt động', value: CouponStatus.ACTIVE },
              { label: 'Ngừng hoạt động', value: CouponStatus.INACTIVE },
              { label: 'Lưu trữ (Archived)', value: CouponStatus.ARCHIVED }
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CouponModal
