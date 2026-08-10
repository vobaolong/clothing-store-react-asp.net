import { LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Form, Input, message } from 'antd'
import { changePassword } from '@/api/auth-api'
import type { ApiError } from '@/types/common.type'

interface ChangePasswordFormValues {
  currentPassword: string
  newPassword: string
  confirm: string
}

export default function ChangePasswordForm() {
  const [form] = Form.useForm<ChangePasswordFormValues>()

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      message.success('Mật khẩu đã được thay đổi thành công.')
      form.resetFields()
    },
    onError: (error: ApiError) => {
      message.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.'
      )
    }
  })

  const onFinish = (values: ChangePasswordFormValues) => {
    mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    })
  }

  return (
    <div className="pt-8 mt-8 border-t border-slate-100">
      <h3 className="mb-6 text-lg font-semibold text-slate-800">
        Đổi mật khẩu
      </h3>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="max-w-md"
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="••••••••"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="••••••••"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(
                  new Error('Mật khẩu xác nhận không khớp!')
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
            loading={isPending}
            className="h-10 px-8 font-medium rounded-lg"
          >
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
