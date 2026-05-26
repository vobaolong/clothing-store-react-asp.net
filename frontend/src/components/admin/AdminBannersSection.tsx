import { PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Switch, Table } from 'antd'
import type { AdminBanner } from '@/types'
import { formatDate } from '@/utils/format'
import { AdminQueryRefreshButton } from '@/components/admin/AdminQueryRefreshButton'
import { AdminTableEditDeleteActions } from '@/components/admin/AdminTableEditDeleteActions'

import { useQuery } from '@tanstack/react-query'
import {
  getAdminBanners,
  deleteAdminBanner,
  updateAdminBanner
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/context/admin/AdminContext'
import toast from 'react-hot-toast'
import { useCallback } from 'react'

export default function AdminBannersSection() {
  const { refresh, confirmDelete, modals, editing, editor } = useAdmin()
  const { clearDirty } = editor

  const bannersQuery = useQuery({
    queryKey: QUERY_KEYS.adminBanners,
    queryFn: getAdminBanners
  })

  const data = bannersQuery.data ?? []
  const loading = bannersQuery.isLoading
  const refreshQuery = bannersQuery

  const onCreate = useCallback(() => {
    editing.setBanner(null)
    clearDirty('banner')
    modals.setBanner(true)
  }, [clearDirty, editing, modals])

  const onEdit = useCallback(
    (banner: AdminBanner) => {
      editing.setBanner(banner)
      clearDirty('banner')
      modals.setBanner(true)
    },
    [clearDirty, editing, modals]
  )

  const onDelete = useCallback(
    (banner: AdminBanner) =>
      confirmDelete('Bạn có chắc chắn muốn xóa banner này?', async () => {
        await deleteAdminBanner(banner.id)
        toast.success('Banner đã được xóa')
        await refresh()
      }),
    [confirmDelete, refresh]
  )

  const onToggleActive = useCallback(
    async (banner: AdminBanner, isActive: boolean) => {
      await updateAdminBanner(banner.id, {
        imageUrl: banner.imageUrl,
        ctaLink: banner.ctaLink,
        startsAt: banner.startsAt ?? null,
        endsAt: banner.endsAt ?? null,
        isActive
      })
      toast.success('Banner đã được cập nhật')
      await refresh()
    },
    [refresh]
  )
  return (
    <div className='space-y-3'>
      <div className='flex gap-2 justify-end w-full'>
        <AdminQueryRefreshButton query={refreshQuery} />
        <Button type='primary' icon={<PlusOutlined />} onClick={onCreate}>
          Thêm banner
        </Button>
      </div>
      <Table
        rowKey='id'
        loading={loading}
        bordered
        dataSource={data}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} banners`
        }}
        locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
        columns={[
          {
            title: '#',
            dataIndex: 'no',
            align: 'center',
            width: 60,
            fixed: 'left',
            render: (_, row: AdminBanner) => data.indexOf(row) + 1
          },
          {
            title: 'Ảnh banner',
            dataIndex: 'imageUrl',
            render: (value: string) => (
              <img
                src={value}
                alt='banner'
                className='object-cover w-auto rounded-md h-30'
              />
            )
          },
          {
            title: 'Liên kết',
            render: (_, row: AdminBanner) => (
              <p className='text-xs truncate max-w-60 text-slate-500'>
                {row.ctaLink}
              </p>
            )
          },
          {
            title: 'Kích hoạt',
            align: 'center',
            dataIndex: 'isActive',
            render: (value: boolean, row: AdminBanner) => (
              <Switch
                checked={value}
                onChange={(nextValue) => onToggleActive(row, nextValue)}
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
            align: 'center',
            fixed: 'right',
            render: (_, row: AdminBanner) => (
              <AdminTableEditDeleteActions
                row={row}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          }
        ]}
      />
    </div>
  )
}
