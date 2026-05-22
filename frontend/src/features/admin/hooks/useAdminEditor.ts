import { useState } from 'react'
import { Modal } from 'antd'

export const useAdminEditor = () => {
  const [dirty, setDirty] = useState<Record<string, boolean>>({})

  const markDirty = (key: string) =>
    setDirty((prev) => ({ ...prev, [key]: true }))
  const clearDirty = (key: string) =>
    setDirty((prev) => ({ ...prev, [key]: false }))

  const requestClose = (key: string, onClose: () => void) => {
    if (!dirty[key]) {
      onClose()
      return
    }
    Modal.confirm({
      title: 'Có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: onClose
    })
  }

  return {
    markDirty,
    clearDirty,
    requestClose,
    isDirty: (key: string) => !!dirty[key]
  }
}
