import { Button, Card, Form, Input, Radio } from 'antd'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { CheckoutFormValues } from '@/types/checkout.type'
import { CheckoutSectionTitle } from '@/components/checkout/CheckoutSectionTitle'
import { PaymentMethod } from '@/enums'
import { useTranslation } from 'react-i18next'

type Props = {
  control: Control<CheckoutFormValues>
  onSubmit: () => void
  isSubmitting: boolean
}

export default function PaymentSection({
  control,
  onSubmit,
  isSubmitting
}: Props) {
  const { t } = useTranslation()
  return (
    <Card>
      <CheckoutSectionTitle step={3} title={t('checkout.paymentAndNotes')} />
      <Form layout="vertical" onFinish={onSubmit}>
        <Form.Item label={t('checkout.paymentMethod')} className="mb-4!">
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Radio.Group {...field} className="flex flex-col space-y-3">
                {[
                  {
                    value: PaymentMethod.COD,
                    label: t('checkout.cod')
                  },
                  { value: PaymentMethod.VNPAY, label: t('checkout.vnpay') }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3! p-3.5! border rounded-xl cursor-pointer transition-colors ${
                      field.value === option.value
                        ? 'border-slate-900 card'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                    }`}
                  >
                    <Radio value={option.value} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </Radio.Group>
            )}
          />
        </Form.Item>

        <Form.Item label={t('checkout.orderNotes')} className="mb-5!">
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder={t('checkout.orderNotesPlaceholder')}
                maxLength={2000}
                showCount
              />
            )}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          className="rounded-lg h-12! text-base font-semibold"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t('checkout.placeOrder')}
        </Button>
      </Form>
    </Card>
  )
}
