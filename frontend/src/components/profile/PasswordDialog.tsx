import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button, Form, Input, Modal, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { changePassword } from '@/api/auth-api'
import type { ApiError } from '@/types/common.type'
import { useTranslation } from 'react-i18next'

type PasswordFormValues = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

const passwordRules = [
  'Tối thiểu 8 ký tự.',
  'Chứa ít nhất 1 chữ cái in hoa.',
  'Chứa ít nhất 1 chữ cái in thường.',
  'Chứa ít nhất 1 chữ số.',
  'Chứa ít nhất 1 ký tự đặc biệt.'
]

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export default function PasswordDialog({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [form] = Form.useForm<PasswordFormValues>()

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      message.success(t('profile.passwordChanged'))
      form.resetFields()
      onClose()
    },
    onError: (error: ApiError) => {
      message.error(
        error.response?.data?.message || t('profile.passwordChangeFailed')
      )
    }
  })

  const handleSubmit = () => {
    form.submit()
  }

  const onFinish = (values: PasswordFormValues) => {
    mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    })
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [form, open])

  return (
    <Modal
      open={open}
      title="Đổi mật khẩu"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isPending}
          onClick={handleSubmit}
        >
          Đổi mật khẩu
        </Button>
      ]}
      destroyOnHidden
      centered
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-700">
            Sử dụng mật khẩu dạng:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            {passwordRules.map((rule) => (
              <li key={rule}>- {rule}</li>
            ))}
          </ul>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại.' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới.' },
              () => ({
                validator(_, value?: string) {
                  if (!value || passwordPattern.test(value)) {
                    return Promise.resolve()
                  }

                  return Promise.reject(
                    new Error(
                      'Mật khẩu mới chưa đáp ứng đủ các quy tắc bảo mật.'
                    )
                  )
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới.' },
              ({ getFieldValue }) => ({
                validator(_, value?: string) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }

                  return Promise.reject(
                    new Error('Mật khẩu xác nhận không khớp.')
                  )
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Xác nhận mật khẩu mới"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
