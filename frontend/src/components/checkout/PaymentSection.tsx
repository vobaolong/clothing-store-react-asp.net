import { Button, Card, Form, Input, Radio } from 'antd'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { CheckoutFormValues } from '@/types/checkout.type'
import { CheckoutSectionTitle } from '@/components/checkout/CheckoutSectionTitle'
import { PaymentMethod } from '@/enums'

type Props = {
  control: Control<CheckoutFormValues>
  onSubmit: () => void
  isSubmitting: boolean
}

export default function PaymentSection({
  control,
  onSubmit,
  isSubmitting,
}: Props) {
  return (
    <Card>
      <CheckoutSectionTitle step={3} title='Phương thức thanh toán & ghi chú' />
      <Form layout='vertical' onFinish={onSubmit}>
        <Form.Item label='Phương thức thanh toán' className='mb-4!'>
          <Controller
            name='paymentMethod'
            control={control}
            render={({ field }) => (
              <Radio.Group {...field} className='flex flex-col space-y-3'>
                {[
                  {
                    value: PaymentMethod.COD,
                    label: 'COD — Thanh toán khi nhận hàng',
                  },
                  { value: PaymentMethod.VNPAY, label: 'VNPay' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3! p-3.5! border rounded-xl cursor-pointer transition-colors ${
                      field.value === option.value
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Radio value={option.value} />
                    <span className='text-sm font-medium text-slate-700'>
                      {option.label}
                    </span>
                  </label>
                ))}
              </Radio.Group>
            )}
          />
        </Form.Item>

        <Form.Item label='Ghi chú đơn hàng (tùy chọn)' className='mb-5!'>
          <Controller
            name='note'
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder='Hướng dẫn giao hàng hoặc ghi chú khác'
                maxLength={2000}
                showCount
              />
            )}
          />
        </Form.Item>

        <Button
          type='primary'
          htmlType='submit'
          block
          className='rounded-lg h-12! text-base font-semibold'
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Đặt hàng
        </Button>
      </Form>
    </Card>
  )
}
