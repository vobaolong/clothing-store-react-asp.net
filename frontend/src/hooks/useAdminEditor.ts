import { useState } from 'react'
import { Modal } from 'antd'
import i18n from 'i18next'

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
      title: i18n.t('admin.unsavedChanges'),
      okText: i18n.t('admin.unsavedOk'),
      cancelText: i18n.t('admin.unsavedCancel'),
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
