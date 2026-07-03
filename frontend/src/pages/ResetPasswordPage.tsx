import { LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Form, Input, message, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@/api/auth-api'
import type { ApiError } from '@/types/common.type'
import { lp } from '@/utils/language-path'

interface ResetPasswordFormValues {
  password: string
  confirm: string
}

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      message.error(t('auth.invalidLink'))
      navigate(lp('/login'))
    }
  }, [token, email, navigate])

  const { mutate, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      message.success(t('auth.passwordResetSuccess'))
      navigate(lp('/login'))
    },
    onError: (error: ApiError) => {
      message.error(
        error.response?.data?.message || t('auth.someError')
      )
    }
  })

  const onFinish = (values: ResetPasswordFormValues) => {
    if (token && email) {
      mutate({
        email,
        token,
        newPassword: values.password
      })
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border-slate-200">
        <div className="mb-8 text-center">
          <Typography.Title level={2} className="mb-2!">
            {t('auth.resetPasswordTitle')}
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            {t('auth.resetPasswordDesc', { email })}
          </Typography.Paragraph>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="password"
            label={t('auth.newPassword')}
            rules={[
              { required: true, message: t('auth.pleaseEnterNewPassword') },
              { min: 6, message: t('auth.passwordMinLength') }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="••••••••"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label={t('auth.confirmNewPassword')}
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.pleaseConfirmPasswordExcl') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error(t('auth.confirmPasswordMismatch'))
                  )
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="••••••••"
            />
          </Form.Item>

          <Form.Item className="mb-0!">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isPending}
              className="h-12 font-semibold rounded-xl"
            >
              {t('auth.resetPassword')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
