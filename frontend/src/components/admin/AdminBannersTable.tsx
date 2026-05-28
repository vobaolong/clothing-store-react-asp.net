import { Switch, Table, Empty, Button, Tooltip } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { AdminBanner } from '@/types'
import { formatDate } from '@/utils/format'
import { AdminTableEditDeleteActions } from '@/components/admin/AdminTableEditDeleteActions'

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
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= data.length) return

    const updatedList = [...data]
    const temp = updatedList[index]
    updatedList[index] = updatedList[targetIndex]
    updatedList[targetIndex] = temp

    const reorderedList = updatedList.map((item, index) => ({
      ...item,
      displayOrder: index
    }))

    onReorder(reorderedList)
  }

  const columns = [
    {
      title: 'Di chuyển',
      key: 'order-actions',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, _row: AdminBanner, index: number) => (
        <div className='flex gap-1 justify-center'>
          <Tooltip title='Di chuyển lên'>
            <Button
              type='text'
              size='small'
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => moveItem(index, 'up')}
            />
          </Tooltip>
          <Tooltip title='Di chuyển xuống'>
            <Button
              type='text'
              size='small'
              icon={<ArrowDownOutlined />}
              disabled={index === data.length - 1}
              onClick={() => moveItem(index, 'down')}
            />
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      width: 100,
      align: 'center' as const,
      render: (value: number) => (
        <span className='font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700 font-bold'>
          {value}
        </span>
      )
    },
    {
      title: 'Ảnh banner',
      dataIndex: 'imageUrl',
      render: (value: string) => (
        <img
          src={value}
          alt='banner'
          className='object-cover w-auto rounded-md h-20 border border-slate-200 shadow-xs'
        />
      )
    },
    {
      title: 'Liên kết',
      render: (_: unknown, row: AdminBanner) => (
        <p className='text-xs truncate max-w-60 text-slate-500 font-mono'>
          {row.ctaLink}
        </p>
      )
    },
    {
      title: 'Kích hoạt',
      align: 'center' as const,
      dataIndex: 'isActive',
      render: (value: boolean, row: AdminBanner) => (
        <Switch
          checked={value}
          onChange={(nextValue) => void onToggleActive(row, nextValue)}
        />
      )
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startsAt',
      render: (value: string) => formatDate(value)
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endsAt',
      render: (value: string) => formatDate(value)
    },
    {
      title: 'Thao tác',
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: unknown, row: AdminBanner) => (
        <AdminTableEditDeleteActions
          row={row}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )
    }
  ]

  return (
    <Table
      rowKey='id'
      loading={loading}
      bordered
      dataSource={data}
      scroll={{ x: 'max-content' }}
      pagination={false}
      locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
      columns={columns}
    />
  )
}
