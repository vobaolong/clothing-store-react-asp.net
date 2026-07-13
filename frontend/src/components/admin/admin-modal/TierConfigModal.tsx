import { useState } from 'react'
import { InputNumber, Modal, Select, Switch } from 'antd'
import { useTranslation } from 'react-i18next'
import { CustomerTier } from '@/enums'
import type { TierConfig } from '@/types'

interface TierConfigModalProps {
  config: TierConfig | null
  open: boolean
  confirmLoading: boolean
  onCancel: () => void
  onConfirm: (payload: {
    minSpend: number
    discountPercent: number
    freeShipping: boolean
  }) => void
  onCreate?: (payload: {
    tier: string
    minSpend: number
    discountPercent: number
    freeShipping: boolean
  }) => void
}

const TIER_OPTIONS = Object.values(CustomerTier).map((t) => ({
  value: t,
  label: t
}))

export default function TierConfigModal({
  config,
  open,
  confirmLoading,
  onCancel,
  onConfirm,
  onCreate
}: TierConfigModalProps) {
  const { t } = useTranslation()
  const [tierName, setTierName] = useState(config?.tier ?? '')
  const [minSpend, setMinSpend] = useState(config?.minSpend ?? 0)
  const [discountPercent, setDiscountPercent] = useState(
    config?.discountPercent ?? 0
  )
  const [freeShipping, setFreeShipping] = useState(
    config?.freeShipping ?? false
  )

  const isBronze = config?.tier === 'Bronze'
  const isEditing = config !== null

  const handleOk = () => {
    if (isEditing) {
      onConfirm({ minSpend, discountPercent, freeShipping })
    } else if (onCreate) {
      onCreate({ tier: tierName, minSpend, discountPercent, freeShipping })
    }
  }

  return (
    <Modal
      title={
        isEditing
          ? `${t('admin.tierConfigEdit')}: ${t(`tier.name.${config.tier.toLowerCase()}` as never)}`
          : t('admin.tierConfigCreate')
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
    >
      <div className="space-y-4 pt-4">
        {!isEditing && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              {t('admin.tierName')}
            </label>
            <Select
              className="w-full!"
              value={tierName || undefined}
              onChange={setTierName}
              options={TIER_OPTIONS}
              placeholder={t('admin.tierName')}
            />
          </div>
        )}
        <div>
          <label className="block mb-1 text-sm font-medium">
            {t('admin.tierMinSpend')}
          </label>
          <InputNumber
            className="w-full!"
            value={minSpend}
            onChange={(v) => setMinSpend(v ?? 0)}
            min={0}
            disabled={isBronze}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => Number(value?.replace(/,/g, '') ?? 0)}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">
            {t('admin.tierDiscountPercent')} (%)
          </label>
          <InputNumber
            className="w-full!"
            value={discountPercent}
            onChange={(v) => setDiscountPercent(v ?? 0)}
            min={0}
            max={100}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={freeShipping} onChange={setFreeShipping} />
          <label className="text-sm font-medium">
            {t('admin.tierFreeShipping')}
          </label>
        </div>
      </div>
    </Modal>
  )
}
