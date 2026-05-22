import { LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Form, Input, message, Typography } from 'antd'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@/api/auth-api'
import type { ApiError } from '@/types/common'

interface ResetPasswordFormValues {
	password: string
	confirm: string
}

export default function ResetPasswordPage() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const token = searchParams.get('token')
	const email = searchParams.get('email')

	useEffect(() => {
		if (!token || !email) {
			message.error('Liên kết không hợp lệ hoặc đã hết hạn.')
			navigate('/login')
		}
	}, [token, email, navigate])

	const { mutate, isPending } = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			message.success('Mật khẩu của bạn đã được đặt lại thành công.')
			navigate('/login')
		},
		onError: (error: ApiError) => {
			message.error(
				error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
			)
		},
	})

	const onFinish = (values: ResetPasswordFormValues) => {
		if (token && email) {
			mutate({
				email,
				token,
				newPassword: values.password,
			})
		}
	}

	return (
		<div className='flex min-h-[70vh] items-center justify-center px-4 py-12'>
			<Card className='w-full max-w-md rounded-3xl border-slate-200 shadow-xl'>
				<div className='mb-8 text-center'>
					<Typography.Title level={2} className='mb-2!'>
						Đặt lại mật khẩu
					</Typography.Title>
					<Typography.Paragraph type='secondary'>
						Nhập mật khẩu mới cho tài khoản {email}
					</Typography.Paragraph>
				</div>

				<Form
					layout='vertical'
					onFinish={onFinish}
					requiredMark={false}
					size='large'
				>
					<Form.Item
						name='password'
						label='Mật khẩu mới'
						rules={[
							{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },
							{ min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
						]}
					>
						<Input.Password
							prefix={<LockOutlined className='text-slate-400' />}
							placeholder='••••••••'
						/>
					</Form.Item>

					<Form.Item
						name='confirm'
						label='Xác nhận mật khẩu mới'
						dependencies={['password']}
						rules={[
							{ required: true, message: 'Vui lòng xác nhận mật khẩu!' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('password') === value) {
										return Promise.resolve()
									}
									return Promise.reject(
										new Error('Mật khẩu xác nhận không khớp!'),
									)
								},
							}),
						]}
					>
						<Input.Password
							prefix={<LockOutlined className='text-slate-400' />}
							placeholder='••••••••'
						/>
					</Form.Item>

					<Form.Item className='mb-0!'>
						<Button
							type='primary'
							htmlType='submit'
							block
							loading={isPending}
							className='h-12 rounded-xl font-semibold'
						>
							Đặt lại mật khẩu
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	)
}
