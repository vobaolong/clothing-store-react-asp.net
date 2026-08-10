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
    <div className="flex items-center justify-between w-full gap-2">
      <div>
        <h2 className="m-0 text-lg font-bold">
          {t('admin.bannerManagerTitle')}
        </h2>
        <p className="text-xs text-slate-500 m-0!">
          {t('admin.bannerManagerDesc')}
        </p>
      </div>
      <div className="flex items-center gap-2">
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
