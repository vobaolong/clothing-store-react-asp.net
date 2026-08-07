import { Button, Form, Input, Modal } from 'antd'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { submitFeedback } from '@/api/feedback-api'

type FeedbackFormValues = {
  name: string
  email: string
  message: string
}

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm<FeedbackFormValues>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: FeedbackFormValues) => {
    setLoading(true)
    try {
      await submitFeedback(values)
      toast.success(t('footer.feedbackSuccess'))
      form.resetFields()
      onClose()
    } catch {
      toast.error(t('footer.feedbackError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={t('footer.feedbackTitle')}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={t('footer.feedbackName')}
          rules={[{ required: true, message: t('footer.feedbackNameRequired') }]}
        >
          <Input placeholder={t('footer.feedbackNamePlaceholder')} maxLength={100} />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('footer.feedbackEmail')}
          rules={[
            { required: true, message: t('footer.feedbackEmailRequired') },
            { type: 'email', message: t('footer.feedbackEmailInvalid') }
          ]}
        >
          <Input placeholder={t('footer.feedbackEmailPlaceholder')} maxLength={200} />
        </Form.Item>
        <Form.Item
          name="message"
          label={t('footer.feedbackMessage')}
          rules={[
            { required: true, message: t('footer.feedbackMessageRequired') },
            { max: 2000, message: t('footer.feedbackMessageMaxLength') }
          ]}
        >
          <Input.TextArea rows={4} placeholder={t('footer.feedbackMessagePlaceholder')} />
        </Form.Item>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="h-10 px-6 rounded-xl">
            {t('footer.feedbackSubmit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
