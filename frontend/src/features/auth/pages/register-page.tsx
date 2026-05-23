import {
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Form, Input, Typography } from 'antd'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '@/api/auth-api'

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
    <ul className='mt-2 text-xs space-y-1'>
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password)
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-slate-400'}`}
          >
            {passed ? (
              <CheckOutlined className='text-green-500' />
            ) : (
              <CloseOutlined className='text-slate-300' />
            )}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  // Use Form.useWatch so the Form manages the value internally — fixes confirm password bug
  const passwordValue: string = Form.useWatch('password', form) ?? ''

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (_data, variables) => {
      toast.success(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
      )
      navigate('/verify-otp', { state: { email: variables.email } })
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
      toast.error(msg ?? 'Không thể tạo tài khoản. Vui lòng thử lại.')
    }
  })

  return (
    <section className='mx-auto flex min-h-[72vh] w-full max-w-md items-center'>
      <Card className='w-full border rounded-3xl border-slate-200 shadow-sm'>
        <div className='mb-6'>
          <Title level={3} className='mb-1!'>
            Tạo tài khoản mới
          </Title>
          <Paragraph className='mb-0! text-slate-500!'>
            Đăng ký Wearly để lưu các sản phẩm yêu thích và thanh toán nhanh
            hơn.
          </Paragraph>
        </div>

        <Form
          form={form}
          layout='vertical'
          onFinish={registerMutation.mutateAsync}
          requiredMark={false}
        >
          <Form.Item
            label='Họ và tên'
            name='fullName'
            rules={[
              { required: true, message: 'Vui lòng nhập đầy đủ họ và tên' },
              { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
            ]}
          >
            <Input
              placeholder='Nguyễn Văn A'
              prefix={<UserOutlined className='text-slate-400' />}
            />
          </Form.Item>

          <Form.Item
            label='Email'
            name='email'
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Định dạng email không hợp lệ' }
            ]}
          >
            <Input
              placeholder='example@gmail.com'
              prefix={<MailOutlined className='text-slate-400' />}
            />
          </Form.Item>

          <Form.Item
            label='Số điện thoại'
            name='phone'
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input
              placeholder='0901234567'
              prefix={<PhoneOutlined className='text-slate-400' />}
            />
          </Form.Item>

          <Form.Item
            label='Mật khẩu'
            name='password'
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
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
              placeholder='Tạo mật khẩu mạnh'
              prefix={<LockOutlined className='text-slate-400' />}
            />
          </Form.Item>

          <PasswordStrengthChecklist password={passwordValue} />

          <Form.Item
            className='mt-4'
            label='Xác nhận mật khẩu'
            name='confirmPassword'
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
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
              placeholder='Nhập lại mật khẩu'
              prefix={<LockOutlined className='text-slate-400' />}
            />
          </Form.Item>

          <Button
            type='primary'
            htmlType='submit'
            block
            loading={registerMutation.isPending}
          >
            Tạo tài khoản
          </Button>
        </Form>

        <div className='mt-5 text-sm text-center text-slate-500'>
          Đã có tài khoản?{' '}
          <Link
            to='/login'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Đăng nhập
          </Link>
        </div>
      </Card>
    </section>
  )
}
