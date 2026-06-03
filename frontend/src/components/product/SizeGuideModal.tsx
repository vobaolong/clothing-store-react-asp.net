import { Modal, Table } from 'antd'
import type { ColumnType } from 'antd/es/table'
import type { MeasurementPresetRow } from '@/constants/measurement-presets.constant'

interface SizeGuideModalProps {
  isOpen: boolean
  onCancel: () => void
  columns: ColumnType<MeasurementPresetRow>[]
  dataSource: MeasurementPresetRow[]
}

export default function SizeGuideModal({
  isOpen,
  onCancel,
  columns,
  dataSource
}: SizeGuideModalProps) {
  return (
    <Modal
      title="Hướng dẫn chọn size"
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={850}
    >
      <p className="mb-4 text-sm text-slate-600">
        Dựa trên cân nặng và chiều cao của bạn để chọn size phù hợp nhất.
      </p>
      {dataSource.length > 0 && (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          rowKey={(record) => record.size}
          bordered
        />
      )}
    </Modal>
  )
}
