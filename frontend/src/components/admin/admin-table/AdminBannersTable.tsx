import { useMemo, useCallback } from 'react'
import { Switch, Table, Empty, Button, Tooltip } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { AdminBanner } from '@/types'
import { formatDate } from '@/utils/format'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'
import { useTranslation } from 'react-i18next'

interface AdminBannersTableProps {
  loading: boolean
  data: AdminBanner[]
  onEdit: (banner: AdminBanner) => void
  onDelete: (banner: AdminBanner) => void
  onToggleActive: (banner: AdminBanner, isActive: boolean) => Promise<void>
  onReorder: (newData: AdminBanner[]) => void
}

export default function AdminBannersTable({
  loading,
  data,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder
}: AdminBannersTableProps) {
  const { t } = useTranslation()
  const moveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= data.length) return

      const updatedList = [...data]
      const temp = updatedList[index]
      updatedList[index] = updatedList[targetIndex]
      updatedList[targetIndex] = temp

      const reorderedList = updatedList.map((item, idx) => ({
        ...item,
        displayOrder: idx
      }))

      onReorder(reorderedList)
    },
    [data, onReorder]
  )

  const columns = useMemo<ColumnsType<AdminBanner>>(
    () => [
      {
        title: t('admin.columnMove'),
        key: 'orderActions',
        width: 120,
        align: 'center',
        render: (_, __, index) => (
          <div className="flex gap-1 justify-center">
            <Tooltip title={t('admin.tooltipMoveUp')}>
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => moveItem(index, 'up')}
              />
            </Tooltip>
            <Tooltip title={t('admin.tooltipMoveDown')}>
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === data.length - 1}
                onClick={() => moveItem(index, 'down')}
              />
            </Tooltip>
          </div>
        )
      },
      {
        title: t('admin.columnOrder'),
        dataIndex: 'displayOrder',
        key: 'displayOrder',
        width: 100,
        align: 'center',
        render: (value: number) => (
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700 font-bold">
            {value}
          </span>
        )
      },
      {
        title: t('admin.columnBannerImage'),
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        render: (value: string) => (
          <img
            src={value}
            alt={t('admin.columnBannerImage')}
            className="object-cover w-auto rounded-md h-20 border border-slate-200 shadow-sm"
          />
        )
      },
      {
        title: t('admin.columnLink'),
        dataIndex: 'ctaLink',
        key: 'ctaLink',
        render: (value: string) => (
          <Tooltip title={value}>
            <p className="text-xs truncate max-w-60 text-slate-500 font-mono">
              {value}
            </p>
          </Tooltip>
        )
      },
      {
        title: t('admin.columnActive'),
        dataIndex: 'isActive',
        key: 'isActive',
        align: 'center',
        render: (value: boolean, row) => (
          <Switch
            checked={value}
            onChange={(nextValue) => void onToggleActive(row, nextValue)}
          />
        )
      },
      {
        title: t('admin.columnStartDate'),
        dataIndex: 'startsAt',
        key: 'startsAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: t('admin.columnEndDate'),
        dataIndex: 'endsAt',
        key: 'endsAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: t('common.action'),
        key: 'actions',
        align: 'center',
        fixed: 'right',
        width: 100,
        render: (_, row) => (
          <AdminUpsertButtonActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      }
    ],
    [data.length, moveItem, onToggleActive, onEdit, onDelete]
  )

  return (
    <Table<AdminBanner>
      rowKey="id"
      loading={loading}
      bordered
      dataSource={data}
      columns={columns}
      scroll={{ x: 'max-content' }}
      pagination={false}
      locale={{ emptyText: <Empty description={t('common.noData')} /> }}
    />
  )
}
