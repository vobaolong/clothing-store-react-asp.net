import { useState } from 'react'
import { Button, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  getAdminTierConfig,
  updateAdminTierConfig,
  createAdminTierConfig,
  deleteAdminTierConfig
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { useAdmin } from '@/context/AdminContext'
import type { TierConfig } from '@/types'
import AdminTierConfigTable from '@/components/admin/admin-table/AdminTierConfigTable'
import TierConfigModal from '@/components/admin/admin-modal/TierConfigModal'

export default function AdminTierConfigSection() {
  const { t } = useTranslation()
  const { refresh } = useAdmin()
  const [editingConfig, setEditingConfig] = useState<TierConfig | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const configsQuery = useQuery({
    queryKey: QUERY_KEYS.adminTierConfig,
    queryFn: getAdminTierConfig
  })

  const invalidate = async () => {
    await refresh()
    configsQuery.refetch()
  }

  const { mutate: doUpdate, isPending: isUpdatePending } = useMutation({
    mutationFn: ({
      tier,
      payload
    }: {
      tier: string
      payload: { minSpend: number; discountPercent: number; freeShipping: boolean }
    }) => updateAdminTierConfig(tier, payload),
    onSuccess: async () => {
      toast.success(t('admin.tierConfigUpdated'))
      setEditingConfig(null)
      await invalidate()
    },
    onError: () => toast.error(t('common.error'))
  })

  const { mutate: doCreate, isPending: isCreatePending } = useMutation({
    mutationFn: (payload: {
      tier: string
      minSpend: number
      discountPercent: number
      freeShipping: boolean
    }) => createAdminTierConfig(payload),
    onSuccess: async () => {
      toast.success(t('admin.tierConfigCreated'))
      setIsCreating(false)
      await invalidate()
    },
    onError: () => toast.error(t('common.error'))
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: (tier: string) => deleteAdminTierConfig(tier),
    onSuccess: async () => {
      toast.success(t('admin.tierConfigDeleted'))
      await invalidate()
    },
    onError: () => toast.error(t('common.error'))
  })

  const handleDelete = (config: TierConfig) => {
    Modal.confirm({
      title: t('admin.deleteConfirmSimple'),
      content: t('admin.tierConfigDeleteConfirm'),
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: () => doDelete(config.tier)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreating(true)}>
          {t('common.add')}
        </Button>
      </div>
      <AdminTierConfigTable
        dataSource={configsQuery.data ?? []}
        loading={configsQuery.isLoading}
        onEdit={setEditingConfig}
        onDelete={handleDelete}
      />
      <TierConfigModal
        key={editingConfig?.id ?? 'create'}
        config={editingConfig}
        open={editingConfig !== null}
        confirmLoading={isUpdatePending}
        onCancel={() => setEditingConfig(null)}
        onConfirm={(payload) => {
          if (editingConfig) doUpdate({ tier: editingConfig.tier, payload })
        }}
      />
      <TierConfigModal
        config={null}
        open={isCreating}
        confirmLoading={isCreatePending}
        onCancel={() => setIsCreating(false)}
        onCreate={(payload) => doCreate(payload)}
        onConfirm={() => {}}
      />
    </div>
  )
}
