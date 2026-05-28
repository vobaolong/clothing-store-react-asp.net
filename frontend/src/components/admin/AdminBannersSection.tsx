import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getAdminBanners,
  deleteAdminBanner,
  updateAdminBanner,
  reorderAdminBanners
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/context/admin/AdminContext'
import toast from 'react-hot-toast'
import { useCallback, useState } from 'react'
import type { AdminBanner } from '@/types'
import AdminBannersToolbar from './AdminBannersToolbar'
import AdminBannersTable from './AdminBannersTable'

export default function AdminBannersSection() {
  const { refresh, confirmDelete, modals, editing, editor } = useAdmin()
  const { clearDirty } = editor

  const bannersQuery = useQuery({
    queryKey: QUERY_KEYS.adminBanners,
    queryFn: getAdminBanners
  })

  const [localBanners, setLocalBanners] = useState<AdminBanner[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [prevData, setPrevData] = useState<AdminBanner[] | undefined>(undefined)

  if (bannersQuery.data !== prevData) {
    setPrevData(bannersQuery.data)
    setLocalBanners(bannersQuery.data ?? [])
    setHasChanges(false)
  }

  const reorderMutation = useMutation({
    mutationFn: reorderAdminBanners,
    onSuccess: async () => {
      toast.success('Đã lưu thứ tự banner mới')
      setHasChanges(false)
      await refresh()
      await bannersQuery.refetch()
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật thứ tự banner')
    }
  })

  const handleReorder = (newData: AdminBanner[]) => {
    setLocalBanners(newData)
    setHasChanges(true)
  }

  const handleSaveOrder = () => {
    const payload = localBanners.map((b, index) => ({
      id: b.id,
      displayOrder: index
    }))
    reorderMutation.mutate(payload)
  }

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
        await bannersQuery.refetch()
      }),
    [confirmDelete, refresh, bannersQuery]
  )

  const onToggleActive = useCallback(
    async (banner: AdminBanner, isActive: boolean) => {
      await updateAdminBanner(banner.id, {
        imageUrl: banner.imageUrl,
        ctaLink: banner.ctaLink,
        startsAt: banner.startsAt ?? null,
        endsAt: banner.endsAt ?? null,
        displayOrder: banner.displayOrder,
        isActive
      })
      toast.success('Trạng thái kích hoạt đã được cập nhật')
      await refresh()
      await bannersQuery.refetch()
    },
    [refresh, bannersQuery]
  )

  return (
    <div className='space-y-3'>
      <AdminBannersToolbar
        query={bannersQuery}
        onCreate={onCreate}
        isReordering={reorderMutation.isPending}
        onSaveOrder={handleSaveOrder}
        hasOrderChanges={hasChanges}
      />
      <AdminBannersTable
        loading={bannersQuery.isLoading}
        data={localBanners}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        onReorder={handleReorder}
      />
    </div>
  )
}
