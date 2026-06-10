import { useMemo } from 'react'
import { Modal, Select } from 'antd'
import { ADMIN_FILTER_ALL_VALUE } from '@/constants/admin-filter.constant'
import { ADMIN_ORDER_STATUS_FILTER_OPTIONS } from '@/options/admin-filter.options'
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
  const bulkUpdateOptions = useMemo(
    () =>
      ADMIN_ORDER_STATUS_FILTER_OPTIONS.filter(
        (opt) => opt.value !== ADMIN_FILTER_ALL_VALUE
      ).map((opt) => ({
        ...opt,
        label: getVietnameseLabel(opt.value)
      })),
    []
  )

  return (
    <Modal
      title="Cập nhật trạng thái hàng loạt"
      open={open}
      onCancel={onCancel}
      confirmLoading={isConfirmLoading}
      onOk={onConfirm}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <div className="py-4 space-y-4">
        <p>
          Bạn đang chọn cập nhật trạng thái cho <strong>{selectedCount}</strong>{' '}
          đơn hàng.
          <br />
          <span className="text-sm text-gray-500">
            Lưu ý: Hệ thống chỉ cập nhật các đơn hàng có thể chuyển sang trạng
            thái mới. Nếu có lỗi, vui lòng kiểm tra lại trạng thái hiện tại của
            đơn hàng.
          </span>
        </p>
        <div>
          <label className="block mb-2 font-medium">Trạng thái mới:</label>
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
