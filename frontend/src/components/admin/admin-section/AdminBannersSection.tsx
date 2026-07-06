import { useCallback, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import {
  getAdminBanners,
  deleteAdminBanner,
  updateAdminBanner,
  reorderAdminBanners
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { useAdmin } from '@/context/AdminContext'
import type { AdminBanner, AdminBannerUpsertPayload } from '@/types'
import AdminBannersToolbar from '@/components/admin/admin-toolbar/AdminBannersToolbar'
import AdminBannersTable from '@/components/admin/admin-table/AdminBannersTable'

export default function AdminBannersSection() {
  const { t } = useTranslation()
  const { refresh, confirmDelete, modals, editing, editor } = useAdmin()
  const { clearDirty } = editor

  const bannersQuery = useQuery({
    queryKey: QUERY_KEYS.adminBanners,
    queryFn: getAdminBanners
  })

  const [draftChanges, setDraftChanges] = useState<AdminBanner[] | null>(null)
  const displayBanners = draftChanges ?? bannersQuery.data ?? []
  const hasChanges = draftChanges !== null

  const { mutate: reorderBanners, isPending: isReordering } = useMutation({
    mutationFn: reorderAdminBanners,
    onSuccess: async () => {
      toast.success(t('admin.bannerSaved'))
      setDraftChanges(null)
      await refresh()
    },
    onError: () => toast.error(t('admin.bannerReorderError'))
  })

  const { mutateAsync: deleteBannerAsync } = useMutation({
    mutationFn: deleteAdminBanner,
    onSuccess: async () => {
      toast.success(t('admin.bannerDeleted'))
      await refresh()
    },
    onError: () => toast.error(t('admin.bannerDeleteFailed'))
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
      toast.success(t('admin.bannerStatusUpdated'))
      await refresh()
    },
    onError: () => toast.error(t('admin.bannerStatusUpdateFailed'))
  })

  const handleReorder = useCallback((newData: AdminBanner[]) => {
    setDraftChanges(newData)
  }, [])

  const handleSaveOrder = useCallback(() => {
    if (!draftChanges) return
    const payload = draftChanges.map((b, index) => ({
      id: b.id,
      displayOrder: index
    }))
    reorderBanners(payload)
  }, [draftChanges, reorderBanners])

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
      confirmDelete(t('admin.bannerDeleteConfirm'), async () => {
        await deleteBannerAsync(banner.id)
      })
    },
    [confirmDelete, deleteBannerAsync, t]
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
        data={displayBanners}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        onReorder={handleReorder}
      />
    </div>
  )
}
