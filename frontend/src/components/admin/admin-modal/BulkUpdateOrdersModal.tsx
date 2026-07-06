import { useMemo } from 'react'
import { Modal, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { useAdminFilterOptions } from '@/options/admin-filter.options'
import { getVietnameseLabel } from '@/constants/i18n.constant'

interface BulkUpdateOrdersModalProps {
  open: boolean
  selectedCount: number
  statusValue: string
  isConfirmLoading: boolean
  onCancel: () => void
  onChangeStatus: (val: string) => void
  onConfirm: () => void
}

export default function BulkUpdateOrdersModal({
  open,
  selectedCount,
  statusValue,
  isConfirmLoading,
  onCancel,
  onChangeStatus,
  onConfirm
}: BulkUpdateOrdersModalProps) {
  const { t } = useTranslation()
  const { orderStatus } = useAdminFilterOptions()
  const bulkUpdateOptions = useMemo(
    () =>
      orderStatus
        .filter(
          (opt: { value: string }) => opt.value !== ADMIN_FILTER_ALL_VALUE
        )
        .map((opt: { value: string; label: string }) => ({
          ...opt,
          label: getVietnameseLabel(opt.value)
        })),
    [orderStatus, t]
  )

  return (
    <Modal
      title={t('admin.bulkUpdateTitle')}
      open={open}
      onCancel={onCancel}
      confirmLoading={isConfirmLoading}
      onOk={onConfirm}
      okText={t('admin.bulkUpdateOk')}
      cancelText={t('common.cancel')}
    >
      <div className="py-4 space-y-4">
        <p>
          <span
            dangerouslySetInnerHTML={{
              __html: t('admin.bulkUpdateDesc', { count: selectedCount })
            }}
          />
          <br />
          <span className="text-sm text-gray-500">
            {t('admin.bulkUpdateNote')}
          </span>
        </p>
        <div>
          <label className="block mb-2 font-medium">
            {t('admin.bulkUpdateLabel')}
          </label>
          <Select
            className="w-full"
            value={statusValue}
            onChange={onChangeStatus}
            options={bulkUpdateOptions}
          />
        </div>
      </div>
    </Modal>
  )
}
