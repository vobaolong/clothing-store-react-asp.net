import { MailOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Form, Input, message, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { forgotPassword } from '@/api/auth-api'
import type { ApiError } from '@/types/common.type'

export default function ForgotPasswordPage() {
  const [form] = Form.useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      message.success(
        'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.'
      )
      form.resetFields()
    },
    onError: (error: ApiError) => {
      message.error(
        error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      )
    }
  })

  const onFinish = (values: { email: string }) => {
    mutate(values.email)
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border-slate-200">
        <div className="mb-8 text-center">
          <Typography.Title level={2} className="mb-2!">
            Quên mật khẩu?
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại
            mật khẩu.
          </Typography.Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-slate-400" />}
              placeholder="name@example.com"
            />
          </Form.Item>

          <Form.Item className="mb-2!">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isPending}
              className="h-12 font-semibold rounded-xl"
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
