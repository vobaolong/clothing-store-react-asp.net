import { useTranslation } from 'react-i18next'
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import toast from 'react-hot-toast'
import { bulkDeleteAdminReviews } from '@/api/admin-api'

type Props = {
	selectedIds: string[]
	onClearSelection: () => void
	onRefresh: () => Promise<void>
}

export default function AdminReviewsSelectionActions({
	selectedIds,
	onClearSelection,
	onRefresh
}: Props) {
	const { t } = useTranslation()
	const handleBulkDelete = async () => {
		try {
			await bulkDeleteAdminReviews(selectedIds)
			toast.success(t('admin.reviewsDeleted'))
			onClearSelection()
			await onRefresh()
		} catch {
			toast.error(t('admin.reviewsDeleteFailed'))
		}
	}

	return (
		<div className="fixed z-50 p-4 rounded-lg shadow-lg -translate-x-1/2 card left-1/2 top-4/5">
			<div className="flex flex-col items-center gap-4 sm:flex-row">
				<Tag
					icon={<CheckCircleOutlined />}
					variant="outlined"
					color="blue"
					className="font-semibold text-gray-700 text-nowrap h-8! items-center flex!"
				>
					{t('admin.reviewsCount', { count: selectedIds.length })}
				</Tag>
				<Button icon={<DeleteOutlined />} onClick={handleBulkDelete} danger>
					<span className="hidden md:block">{t('common.delete')}</span>
				</Button>
			</div>
		</div>
	)
}
