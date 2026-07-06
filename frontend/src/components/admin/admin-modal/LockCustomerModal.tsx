import { Modal, Select } from 'antd'
import { useAdminCustomerLockReasonOptions } from '@/options/admin-customer.options'
import type { Customer } from '@/types'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const lockReasonOptions = useAdminCustomerLockReasonOptions()
  return (
    <Modal
      title={t('admin.lockAccount')}
      destroyOnHidden
      open={Boolean(target)}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      confirmLoading={isLocking}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <p className="mb-2 text-sm text-slate-600">{t('admin.emailReasonBan')}</p>
      <label className="block mb-1 text-sm font-medium" htmlFor="lock-reason">
        {t('admin.lockCustomerReason')}
      </label>
      <Select
        className="w-full"
        id="lock-reason"
        placeholder={t('admin.selectReason')}
        value={reason}
        onChange={onChangeReason}
        options={lockReasonOptions}
      />
    </Modal>
  )
}
