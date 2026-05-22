import { Button, Form, Input, Rate, Select } from 'antd'
import { useEffect } from 'react'
import type { ProductReview } from '@/types'

type ReviewFormValues = {
  rating: number
  comment?: string
  tags?: string[]
}

type ReviewFormProps = {
  review?: ProductReview | null
  loading?: boolean
  onSubmit: (values: ReviewFormValues) => Promise<void> | void
  onCancel?: () => void
}

export default function ReviewForm({
  review,
  loading,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [form] = Form.useForm<ReviewFormValues>()

  useEffect(() => {
    form.setFieldsValue({
      rating: review?.rating ?? 5,
      comment: review?.comment ?? '',
      tags: review?.tags ?? [],
    })
  }, [form, review])

  const tagOptions = [
    'Chất vải đẹp',
    'Đúng size',
    'Giao hàng nhanh',
    'Đóng gói kỹ',
    'Giá hợp lý',
    'Giống mô tả',
  ]

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        rating: review?.rating ?? 5,
        comment: review?.comment ?? '',
        tags: review?.tags ?? [],
      }}
      onFinish={onSubmit}
    >
      <Form.Item
        name='rating'
        label='Đánh giá'
        rules={[{ required: true, message: 'Vui lòng chọn mức độ hài lòng' }]}
      >
        <Rate />
      </Form.Item>
      <Form.Item name='tags' label='Đặc điểm sản phẩm'>
        <Select
          mode='tags'
          placeholder='Chọn hoặc nhập các đặc điểm (VD: Chất vải đẹp, Đúng size...)'
          options={tagOptions.map((tag) => ({ label: tag, value: tag }))}
          className='w-full'
        />
      </Form.Item>
      <Form.Item
        name='comment'
        label='Nhận xét'
        rules={[{ max: 1000, message: 'Nội dung quá dài' }]}
      >
        <Input.TextArea
          rows={4}
          placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này'
        />
      </Form.Item>
      <div className='flex items-center justify-end gap-2'>
        {onCancel ? (
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        ) : null}
        <Button
          type='primary'
          htmlType='submit'
          loading={loading}
          className='rounded-xl h-10 px-6'
        >
          {review ? 'Cập nhật' : 'Gửi đánh giá'}
        </Button>
      </div>
    </Form>
  )
}
