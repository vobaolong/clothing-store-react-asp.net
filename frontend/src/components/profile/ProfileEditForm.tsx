import { Button, Form, Input, Row, Col } from 'antd'
import { updateMyProfile } from '@/api/profile-api'
import type { MyProfile } from '@/types'

type Props = {
  initial?: MyProfile
  onSaved: () => void
  onCancel: () => void
}

export default function ProfileEditForm({ initial, onSaved, onCancel }: Props) {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        fullName: initial?.fullName ?? '',
        phone: initial?.phone ?? ''
      }}
      onFinish={async (values) => {
        await updateMyProfile({
          fullName: values.fullName,
          phone: values.phone
        })
        onSaved()
      }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name='fullName'
            label='Full name'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='phone' label='Phone' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <div className='flex justify-end gap-2'>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type='primary' onClick={() => form.submit()}>
          Save
        </Button>
      </div>
    </Form>
  )
}
