import { useTranslation } from 'react-i18next'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import toast from 'react-hot-toast'
import { bulkUpdateCategoriesActive } from '@/api/admin-api'

type Props = {
  selectedIds: string[]
  onClearSelection: () => void
  onRefresh: () => Promise<void>
}

export default function AdminCategoriesSelectionActions({
  selectedIds,
  onClearSelection,
  onRefresh
}: Props) {
  const { t } = useTranslation()
  const handleBulkActiveChange = async (isActive: boolean) => {
    try {
      await bulkUpdateCategoriesActive({
        ids: selectedIds,
        isActive
      })
      toast.success(
        isActive
          ? t('admin.categoriesActivated')
          : t('admin.categoriesDeactivated')
      )
      onClearSelection()
      await onRefresh()
    } catch {
      toast.error(t('admin.categoriesUpdateFailed'))
    }
  }

  return (
    <div className="fixed z-50 p-4 -translate-x-1/2 rounded-lg shadow-lg card left-1/2 top-4/5">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Tag
          icon={<CheckCircleOutlined />}
          variant="outlined"
          color="blue"
          className="font-semibold text-gray-700 text-nowrap h-8! items-center flex!"
        >
          {selectedIds.length} {t('admin.categories').toLowerCase()}
        </Tag>
        <Button
          icon={<CheckCircleOutlined />}
          onClick={() => void handleBulkActiveChange(true)}
        >
          <span className="hidden md:block">{t('admin.activate')}</span>
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          danger
          onClick={() => void handleBulkActiveChange(false)}
        >
          <span className="hidden md:block">{t('admin.deactivate')}</span>
        </Button>
      </div>
    </div>
  )
}
