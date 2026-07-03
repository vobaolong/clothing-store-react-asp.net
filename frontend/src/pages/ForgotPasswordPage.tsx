import { MailOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Form, Input, message, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { forgotPassword } from '@/api/auth-api'
import type { ApiError } from '@/types/common.type'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      message.success(t('auth.resetLinkSent'))
      form.resetFields()
    },
    onError: (error: ApiError) => {
      message.error(
        error.response?.data?.message || t('auth.someError')
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
            {t('auth.forgotPasswordTitle')}
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            {t('auth.forgotPasswordDesc')}
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
            label={t('auth.email')}
            rules={[
              { required: true, message: t('auth.pleaseEnterEmailExcl') },
              { type: 'email', message: t('auth.invalidEmailExcl') }
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-slate-500" />}
              placeholder="name@example.com"
              allowClear
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
              {t('auth.sendRequest')}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
