import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Button, Space, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

type AdminUpsertButtonActionsProps<T> = {
  row: T
  onView?: (row: T) => void
  onEdit: (row: T) => void
  onDelete: (row: T) => void
  viewTitle?: string
  editTitle?: string
  deleteTitle?: string
}

export function AdminUpsertButtonActions<T extends Record<string, unknown>>({
  row,
  onView,
  onEdit,
  onDelete,
  viewTitle,
  editTitle,
  deleteTitle
}: AdminUpsertButtonActionsProps<T>) {
  const { t } = useTranslation()
  const resolvedView = viewTitle ?? t('common.view')
  const resolvedEdit = editTitle ?? t('common.edit')
  const resolvedDelete = deleteTitle ?? t('common.delete')

  return (
    <Space>
      {onView ? (
        <Tooltip title={resolvedView}>
          <Button icon={<EyeOutlined />} onClick={() => onView(row)} />
        </Tooltip>
      ) : null}
      <Tooltip title={resolvedEdit}>
        <Button icon={<EditOutlined />} onClick={() => onEdit(row)} />
      </Tooltip>
      <Tooltip title={resolvedDelete}>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(row)}
        />
      </Tooltip>
    </Space>
  )
}
