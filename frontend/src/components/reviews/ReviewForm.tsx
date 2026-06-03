import { Button, Form, Input, Rate, Select } from 'antd'
import { useEffect } from 'react'
import { REVIEW_TAG_OPTIONS } from '@/options/review.options'

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
      <Form.Item name="rating" label="Chấm điểm đơn hàng của bạn">
        <Rate />
      </Form.Item>
      <Form.Item name="tags" label="Đặc điểm sản phẩm">
        <Select
          mode="tags"
          placeholder="Chọn hoặc nhập các đặc điểm (VD: Chất vải đẹp, Đúng size...)"
          options={REVIEW_TAG_OPTIONS.map((tag) => ({
            label: tag,
            value: tag
          }))}
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="comment"
        label="Chất lượng sản phẩm"
        rules={[{ max: 300, message: 'Nội dung quá dài' }]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Bạn thích hoặc không thích điều gì về sản phẩm này?"
        />
      </Form.Item>
      <div className="flex gap-2 justify-end items-center">
        {onCancel ? (
          <Button onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        ) : null}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="px-6 h-10 rounded-xl"
        >
          Gửi đánh giá
        </Button>
      </div>
    </Form>
  )
}
