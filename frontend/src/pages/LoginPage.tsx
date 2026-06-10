import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Form, Input } from 'antd'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '@/api/auth-api'
import { setAuth, isAdmin } from '@/state/auth'
import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const emailRef = useRef<string>('')

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (token) => {
      dispatch(setAuth(token))
      toast.success('Đăng nhập thành công')
      navigate(isAdmin() ? '/admin' : '/')
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
        toast.error(
          'Tài khoản chưa xác thực. Vui lòng nhập OTP được gửi qua email.',
          {
            duration: 4000
          }
        )
        navigate('/verify-otp', { state: { email: emailRef.current } })
        return
      }

      toast.error(msg ?? 'Đăng nhập thất bại. Kiểm tra email và mật khẩu.')
    }
  })

  return (
    <div className="mx-auto flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl">
        <h1 className="mb-4 text-2xl font-semibold">Đăng nhập</h1>
        <Form
          layout="vertical"
          onFinish={loginMutation.mutateAsync}
          onValuesChange={(changed) => {
            if (changed.email) emailRef.current = changed.email
          }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Định dạng email không hợp lệ' }
            ]}
          >
            <Input
              placeholder="Email"
              prefix={<UserOutlined className="text-slate-500" />}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
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
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loginMutation.isPending}
          >
            Đăng nhập
          </Button>
        </Form>
        <p className="mt-4! text-center text-sm text-slate-500">
          Bạn chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Đăng ký ngay
          </Link>
        </p>
      </Card>
    </div>
  )
}
