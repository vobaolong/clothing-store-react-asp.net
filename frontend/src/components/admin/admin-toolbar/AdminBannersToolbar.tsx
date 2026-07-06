import { useTranslation } from 'react-i18next'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import {
  AdminRefreshButtonAction,
  type AdminRefreshQuery
} from '@/components/admin/AdminRefreshButtonAction'

interface AdminBannersToolbarProps {
  query: AdminRefreshQuery
  onCreate: () => void
  isReordering?: boolean
  onSaveOrder?: () => void
  hasOrderChanges?: boolean
}

export default function AdminBannersToolbar({
  query,
  onCreate,
  isReordering = false,
  onSaveOrder,
  hasOrderChanges = false
}: AdminBannersToolbarProps) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2 justify-between items-center w-full p-3 rounded-lg shadow-xs">
      <div>
        <h2 className="text-lg font-bold m-0">{t('admin.bannerManagerTitle')}</h2>
        <p className="text-xs text-slate-500">
          {t('admin.bannerManagerDesc')}
        </p>
      </div>
      <div className="flex gap-2 items-center">
        <AdminRefreshButtonAction query={query} />
        {hasOrderChanges && onSaveOrder && (
          <Button
            type="text"
            color="primary"
            variant="outlined"
            loading={isReordering}
            onClick={onSaveOrder}
          >
            {t('admin.saveOrder')}
          </Button>
        )}
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          {t('admin.create')}
        </Button>
      </div>
    </div>
  )
}
