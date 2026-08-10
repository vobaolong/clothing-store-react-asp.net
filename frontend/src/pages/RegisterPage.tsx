import {
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Form, Input, Typography } from 'antd'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '@/api/auth-api'
import { lp } from '@/utils/language-path'

const { Title, Paragraph } = Typography

interface PasswordRule {
  label: string
  test: (v: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Ít nhất 8 ký tự', test: (v) => v.length >= 8 },
  { label: 'Có ít nhất 1 chữ hoa (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { label: 'Có ít nhất 1 chữ thường (a–z)', test: (v) => /[a-z]/.test(v) },
  { label: 'Có ít nhất 1 chữ số (0–9)', test: (v) => /[0-9]/.test(v) }
]

function validatePasswordStrength(value: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(value))
      return `Mật khẩu chưa đủ mạnh: ${rule.label.toLowerCase()}`
  }
  return null
}

function PasswordStrengthChecklist({ password }: { password: string }) {
  if (!password) return null
  return (
    <ul className="mt-2 text-xs space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password)
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-slate-500'}`}
          >
            {passed ? (
              <CheckOutlined className="text-green-500" />
            ) : (
              <CloseOutlined className="text-slate-300" />
            )}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const passwordValue: string = Form.useWatch('password', form) ?? ''

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (_data, variables) => {
      toast.success(t('auth.registerSuccess'))
      navigate(lp('/verify-otp'), { state: { email: variables.email } })
    },
    onError: (error) => {
      const payload = axios.isAxiosError(error)
        ? error.response?.data
        : undefined
      const raw =
        payload && typeof payload === 'object' && 'message' in payload
          ? (payload as { message?: unknown }).message
          : undefined
      const msg = typeof raw === 'string' && raw.trim() ? raw.trim() : null
      toast.error(msg ?? t('auth.registerFailed'))
    }
  })

  return (
    <section className="mx-auto flex min-h-[72vh] w-full max-w-md items-center">
      <Card className="w-full border rounded-3xl shadow-sm border-slate-200">
        <div className="mb-6">
          <Title level={3} className="mb-1!">
            {t('auth.registerTitle')}
          </Title>
          <Paragraph className="mb-0! text-slate-500!">
            {t('auth.registerSubtitle')}
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={registerMutation.mutateAsync}
          requiredMark={false}
        >
          <Form.Item
            label={t('auth.fullName')}
            name="fullName"
            rules={[
              { required: true, message: t('auth.pleaseEnterFullName') },
              { min: 2, message: t('auth.fullNameMinLength') }
            ]}
          >
            <Input
              placeholder={t('auth.fullNamePlaceholder')}
              prefix={<UserOutlined className="text-slate-500" />}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label={t('auth.email')}
            name="email"
            rules={[
              { required: true, message: t('auth.pleaseEnterEmail') },
              { type: 'email', message: t('auth.invalidEmail') }
            ]}
          >
            <Input
              placeholder={t('auth.emailPlaceholder')}
              prefix={<MailOutlined className="text-slate-500" />}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label={t('auth.phone')}
            name="phone"
            rules={[{ required: true, message: t('auth.pleaseEnterPhone') }]}
          >
            <Input
              placeholder={t('auth.phonePlaceholder')}
              prefix={<PhoneOutlined className="text-slate-500" />}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label={t('auth.password')}
            name="password"
            rules={[
              { required: true, message: t('auth.pleaseEnterPassword') },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  const err = validatePasswordStrength(value)
                  return err
                    ? Promise.reject(new Error(err))
                    : Promise.resolve()
                }
              }
            ]}
          >
            <Input.Password
              placeholder={t('auth.createStrongPassword')}
              prefix={<LockOutlined className="text-slate-500" />}
            />
          </Form.Item>

          <PasswordStrengthChecklist password={passwordValue} />

          <Form.Item
            className="mt-4"
            label={t('auth.confirmPassword')}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.pleaseConfirmPassword') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error('Mật khẩu xác nhận không khớp')
                  )
                }
              })
            ]}
          >
            <Input.Password
              placeholder={t('auth.reEnterPassword')}
              prefix={<LockOutlined className="text-slate-500" />}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={registerMutation.isPending}
          >
            {t('auth.createAccount')}
          </Button>
        </Form>

        <div className="mt-5 text-sm text-center text-slate-500">
          {t('auth.hasAccount')}{' '}
          <Link
            to={lp('/login')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {t('auth.login')}
          </Link>
        </div>
      </Card>
    </section>
  )
}
