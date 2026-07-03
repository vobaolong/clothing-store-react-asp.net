import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Form, Input } from 'antd'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '@/api/auth-api'
import { setAuth, isAdmin } from '@/state/auth'
import { lp } from '@/utils/language-path'
import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const emailRef = useRef<string>('')

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (token) => {
      dispatch(setAuth(token))
      toast.success(t('auth.loginSuccess'))
      navigate(isAdmin() ? lp('/admin') : lp('/'))
    },
    onError: (error) => {
      const payload = axios.isAxiosError(error)
        ? error.response?.data
        : undefined
      const raw =
        payload &&
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload
          ? (payload as { message: unknown }).message
          : undefined
      const msg = typeof raw === 'string' && raw.trim() ? raw.trim() : null

      if (msg?.includes('chưa được xác thực') || msg?.includes('OTP')) {
        toast.error(t('auth.notVerified'), {
          duration: 4000
        })
        navigate(lp('/verify-otp'), { state: { email: emailRef.current } })
        return
      }

      toast.error(msg ?? t('auth.loginFailed'))
    }
  })

  return (
    <div className="mx-auto flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl">
        <h1 className="mb-4 text-2xl font-semibold">{t('auth.login')}</h1>
        <Form
          layout="vertical"
          onFinish={loginMutation.mutateAsync}
          onValuesChange={(changed) => {
            if (changed.email) emailRef.current = changed.email
          }}
        >
          <Form.Item
            label={t('auth.email')}
            name="email"
            rules={[
              { required: true, message: t('auth.pleaseEnterEmail') },
              { type: 'email', message: t('auth.invalidEmail') }
            ]}
          >
            <Input
              placeholder={t('auth.email')}
              prefix={<UserOutlined className="text-slate-500" />}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label={t('auth.password')}
            name="password"
            rules={[{ required: true, message: t('auth.pleaseEnterPassword') }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-500" />}
            />
          </Form.Item>
          <div className="flex justify-between items-center mb-4">
            <Form.Item
              name="rememberMe"
              valuePropName="checked"
              initialValue={false}
              className="mb-0!"
            >
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {t('auth.forgotPassword')}?
            </Link>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loginMutation.isPending}
          >
            {t('auth.login')}
          </Button>
        </Form>
        <p className="mt-4! text-center text-sm text-slate-500">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-500"
          >
            {t('auth.registerNow')}
          </Link>
        </p>
      </Card>
    </div>
  )
}
