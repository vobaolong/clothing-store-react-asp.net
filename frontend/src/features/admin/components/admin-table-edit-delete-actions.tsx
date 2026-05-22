import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Button, Space, Tooltip } from 'antd'

type AdminTableEditDeleteActionsProps<T> = {
  row: T
  onView?: (row: T) => void
  onEdit: (row: T) => void
  onDelete: (row: T) => void
  viewTitle?: string
  editTitle?: string
  deleteTitle?: string
}

export function AdminTableEditDeleteActions<T>({
  row,
  onView,
  onEdit,
  onDelete,
  viewTitle = 'Xem',
  editTitle = 'Sửa',
  deleteTitle = 'Xóa'
}: AdminTableEditDeleteActionsProps<T>) {
  return (
    <Space>
      {onView ? (
        <Tooltip title={viewTitle}>
          <Button icon={<EyeOutlined />} onClick={() => onView(row)} />
        </Tooltip>
      ) : null}
      <Tooltip title={editTitle}>
        <Button icon={<EditOutlined />} onClick={() => onEdit(row)} />
      </Tooltip>
      <Tooltip title={deleteTitle}>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(row)}
        />
      </Tooltip>
    </Space>
  )
}
