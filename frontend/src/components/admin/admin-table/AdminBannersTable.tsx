import { useMemo, useCallback } from 'react'
import { Switch, Table, Empty, Button, Tooltip } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { AdminBanner } from '@/types'
import { formatDate } from '@/utils/format'
import { AdminUpsertButtonActions } from '../AdminUpsertButtonActions'

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
        title: 'Di chuyển',
        key: 'orderActions',
        width: 120,
        align: 'center',
        render: (_, __, index) => (
          <div className="flex gap-1 justify-center">
            <Tooltip title="Di chuyển lên">
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => moveItem(index, 'up')}
              />
            </Tooltip>
            <Tooltip title="Di chuyển xuống">
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === data.length - 1} // Lưu ý: giữ lại độ dài thực tế để tắt nút
                onClick={() => moveItem(index, 'down')}
              />
            </Tooltip>
          </div>
        )
      },
      {
        title: 'Thứ tự',
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
        title: 'Ảnh banner',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        render: (value: string) => (
          <img
            src={value}
            alt="banner"
            className="object-cover w-auto rounded-md h-20 border border-slate-200 shadow-sm"
          />
        )
      },
      {
        title: 'Liên kết',
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
        title: 'Kích hoạt',
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
        title: 'Ngày bắt đầu',
        dataIndex: 'startsAt',
        key: 'startsAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Ngày kết thúc',
        dataIndex: 'endsAt',
        key: 'endsAt',
        render: (value: string) => formatDate(value)
      },
      {
        title: 'Thao tác',
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
      locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
    />
  )
}
