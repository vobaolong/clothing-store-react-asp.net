import { Button, Form, Input, Rate, Select } from 'antd'
import { useEffect } from 'react'
import { REVIEW_TAG_OPTIONS } from '@/options/review.options'
import { useTranslation } from 'react-i18next'

type ReviewFormValues = {
  rating: number
  comment?: string
  tags?: string[]
}

type ReviewFormProps = {
  loading?: boolean
  onSubmit: (values: ReviewFormValues) => Promise<void> | void
  onCancel?: () => void
}

export default function ReviewForm({
  loading,
  onSubmit,
  onCancel
}: ReviewFormProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm<ReviewFormValues>()

  useEffect(() => {
    form.setFieldsValue({
      rating: 5,
      comment: '',
      tags: []
    })
  }, [form])

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item name="rating" label={t('review.rateOrder')}>
        <Rate />
      </Form.Item>
      <Form.Item name="tags" label={t('review.productFeatures')}>
        <Select
          mode="tags"
          placeholder={t('review.productFeaturesPlaceholder')}
          options={REVIEW_TAG_OPTIONS.map((tag) => ({
            label: tag,
            value: tag
          }))}
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="comment"
        label={t('review.reviewComment')}
        rules={[{ max: 300, message: t('review.reviewCommentMaxLength') }]}
      >
        <Input.TextArea
          rows={4}
          placeholder={t('review.reviewCommentPlaceholder') as string}
        />
      </Form.Item>
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
        ) : null}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="h-10 px-6 rounded-xl"
        >
          {t('review.submitReview')}
        </Button>
      </div>
    </Form>
  )
}
