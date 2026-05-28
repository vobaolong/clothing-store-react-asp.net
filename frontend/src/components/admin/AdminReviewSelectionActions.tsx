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
  const handleBulkDelete = async () => {
    try {
      await bulkDeleteAdminReviews(selectedIds)
      toast.success('Đã xóa đánh giá')
      onClearSelection()
      await onRefresh()
    } catch {
      toast.error('Xóa thất bại')
    }
  }

  return (
    <div className='fixed z-50 p-4 bg-white border border-blue-300 rounded-lg shadow-lg left-1/2 top-4/5 -translate-x-1/2'>
      <div className='flex flex-col gap-4 items-center sm:flex-row'>
        <Tag
          icon={<CheckCircleOutlined />}
          variant='outlined'
          color='blue'
          className='font-semibold text-gray-700 text-nowrap h-8! items-center flex!'
        >
          {selectedIds.length} đánh giá
        </Tag>
        <Button icon={<DeleteOutlined />} onClick={handleBulkDelete} danger>
          <span className='hidden md:block'>Xóa</span>
        </Button>
      </div>
    </div>
  )
}
