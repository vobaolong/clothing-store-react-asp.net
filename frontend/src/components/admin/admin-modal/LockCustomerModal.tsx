import { Modal, Select } from 'antd'
import type { Customer } from '@/types'

interface LockCustomerModalProps {
  target: Customer | null
  reason: string | undefined
  isLocking: boolean
  onCancel: () => void
  onChangeReason: (value: string) => void
  onConfirm: () => void
}

export default function LockCustomerModal({
  target,
  reason,
  isLocking,
  onCancel,
  onChangeReason,
  onConfirm
}: LockCustomerModalProps) {
  return (
    <Modal
      title="Khóa tài khoản"
      destroyOnHidden
      open={Boolean(target)}
      okText="Xác nhận khóa"
      confirmLoading={isLocking}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <p className="mb-2 text-sm text-slate-600">
        Email sẽ được gửi đến khách hàng với nội dung dựa trên lý do đã chọn.
      </p>
      <label className="block mb-1 text-sm font-medium" htmlFor="lock-reason">
        Lý do khóa tài khoản
      </label>
      <Select
        className="w-full"
        id="lock-reason"
        placeholder="Chọn lý do"
        value={reason}
        onChange={onChangeReason}
        options={[
          { value: 'Vi phạm điều khoản', label: 'Vi phạm điều khoản' },
          { value: 'Hoạt động bất thường', label: 'Hoạt động bất thường' },
          {
            value: 'Theo yêu cầu người dùng',
            label: 'Theo yêu cầu người dùng'
          },
          { value: 'Khác', label: 'Khác' }
        ]}
      />
    </Modal>
  )
}
