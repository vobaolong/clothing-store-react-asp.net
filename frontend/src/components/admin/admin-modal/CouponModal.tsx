import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createCoupon, updateCoupon } from '@/api/coupons-api'
import { CouponDiscountType, CouponStatus } from '@/enums'
import {
  COUPON_DISCOUNT_TYPE_OPTIONS,
  COUPON_STATUS_OPTIONS
} from '@/options/coupon.options'
import type { Coupon } from '@/types'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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

      toast.success(editing ? t('admin.voucherUpdated') : t('admin.voucherCreated'))
      onSaved()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || t('admin.voucherServerError'))
      } else if (!(err instanceof Error && 'errorFields' in err)) {
        toast.error(t('admin.voucherSaveError'))
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      title={editing ? t('admin.voucherEditTitle') : t('admin.voucherCreateTitle')}
      open={open}
      forceRender
      onOk={save}
      onCancel={onClose}
      okText={t('admin.voucherSave')}
      cancelText={t('common.cancel')}
      okButtonProps={{ loading: isSaving, disabled: isSaving }}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item
          name="code"
          label={t('admin.voucherCodeLabel')}
          rules={[{ required: true, message: t('admin.voucherCodeRequired') }]}
        >
          <Input placeholder={t('admin.voucherCodePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="discountType"
          label={t('admin.voucherDiscountTypeLabel')}
          rules={[{ required: true }]}
        >
          <Select
            options={COUPON_DISCOUNT_TYPE_OPTIONS.map((option) => ({
              ...option
            }))}
          />
        </Form.Item>

        <Form.Item
          name="discountAmount"
          label={isPercent ? t('admin.voucherDiscountPercentLabel') : t('admin.voucherDiscountFlatLabel')}
          rules={[
            { required: true, message: t('admin.voucherDiscountRequired') },
            {
              type: 'number',
              min: isPercent ? 1 : 0,
              max: isPercent ? 100 : undefined,
              message: isPercent
                ? t('admin.voucherDiscountMin')
                : t('admin.voucherDiscountMinFlat')
            }
          ]}
        >
          <InputNumber precision={0} className="w-full!" />
        </Form.Item>

        <Form.Item
          name="minOrderSubtotal"
          label={t('admin.voucherMinOrderLabel')}
          rules={[
            { required: true, message: t('admin.voucherMinOrderRequired') }
          ]}
        >
          <InputNumber min={0} className="w-full!" />
        </Form.Item>

        <Form.Item
          name="maxUsage"
          label={t('admin.voucherMaxUsageLabel')}
          rules={[
            { required: true, message: t('admin.voucherMaxUsageRequired') }
          ]}
        >
          <InputNumber min={1} precision={0} className="w-full!" />
        </Form.Item>

        <Form.Item
          name="startsAt"
          label={t('admin.voucherStartDateLabel')}
          extra={t('admin.voucherStartDateExtra')}
        >
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="HH:mm:ss DD/MM/YYYY"
            className="w-full"
            allowClear
            placeholder={t('admin.chooseDate')}
          />
        </Form.Item>

        <Form.Item
          name="expiresAt"
          label={t('admin.voucherExpiryLabel')}
          rules={[{ required: true, message: t('admin.voucherExpiryRequired') }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="HH:mm:ss DD/MM/YYYY"
            className="w-full"
            placeholder={t('admin.chooseDate')}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={t('admin.voucherStatusLabel')}
          rules={[{ required: true }]}
        >
          <Select
            options={COUPON_STATUS_OPTIONS.map((option) => ({ ...option }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CouponModal
