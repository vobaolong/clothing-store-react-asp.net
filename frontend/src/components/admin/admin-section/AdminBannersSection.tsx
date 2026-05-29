import { useCallback, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import {
  getAdminBanners,
  deleteAdminBanner,
  updateAdminBanner,
  reorderAdminBanners
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAdmin } from '@/context/admin/AdminContext'
import type { AdminBanner, AdminBannerUpsertPayload } from '@/types'
import AdminBannersToolbar from '@/components/admin/admin-toolbar/AdminBannersToolbar'
import AdminBannersTable from '@/components/admin/admin-table/AdminBannersTable'

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

  // --- 3. Các Mutations xử lý API (TanStack Query) ---
  const { mutate: reorderBanners, isPending: isReordering } = useMutation({
    mutationFn: reorderAdminBanners,
    onSuccess: async () => {
      toast.success('Đã lưu thứ tự banner mới')
      setHasChanges(false)
      await refresh()
      bannersQuery.refetch()
    },
    onError: () => toast.error('Lỗi khi cập nhật thứ tự banner')
  })

  const { mutateAsync: deleteBannerAsync } = useMutation({
    mutationFn: deleteAdminBanner,
    onSuccess: async () => {
      toast.success('Banner đã được xóa')
      await refresh()
      bannersQuery.refetch()
    },
    onError: () => toast.error('Xóa banner thất bại')
  })

  const { mutateAsync: updateBannerAsync } = useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string
      payload: AdminBannerUpsertPayload
    }) => updateAdminBanner(id, payload),
    onSuccess: async () => {
      toast.success('Trạng thái kích hoạt đã được cập nhật')
      await refresh()
      bannersQuery.refetch()
    },
    onError: () => toast.error('Cập nhật trạng thái thất bại')
  })

  const handleReorder = useCallback((newData: AdminBanner[]) => {
    setLocalBanners(newData)
    setHasChanges(true)
  }, [])

  const handleSaveOrder = useCallback(() => {
    const payload = localBanners.map((b, index) => ({
      id: b.id,
      displayOrder: index
    }))
    reorderBanners(payload)
  }, [localBanners, reorderBanners])

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
    async (banner: AdminBanner) => {
      confirmDelete('Bạn có chắc chắn muốn xóa banner này?', async () => {
        await deleteBannerAsync(banner.id)
      })
    },
    [confirmDelete, deleteBannerAsync]
  )

  const onToggleActive = useCallback(
    async (banner: AdminBanner, isActive: boolean) => {
      await updateBannerAsync({
        id: banner.id,
        payload: {
          imageUrl: banner.imageUrl,
          ctaLink: banner.ctaLink,
          startsAt: banner.startsAt ?? null,
          endsAt: banner.endsAt ?? null,
          displayOrder: banner.displayOrder,
          isActive
        }
      })
    },
    [updateBannerAsync]
  )

  return (
    <div className="space-y-3">
      <AdminBannersToolbar
        query={bannersQuery}
        onCreate={onCreate}
        isReordering={isReordering}
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
