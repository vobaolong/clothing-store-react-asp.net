import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import toast from 'react-hot-toast'
import { bulkUpdateCategoriesActive } from '@/api/admin-api'

type Props = {
  selectedIds: string[]
  onClearSelection: () => void
  onRefresh: () => Promise<void>
}

export default function AdminCategoriesBulkActions({
  selectedIds,
  onClearSelection,
  onRefresh
}: Props) {
  const handleBulkActiveChange = async (isActive: boolean) => {
    try {
      await bulkUpdateCategoriesActive({
        ids: selectedIds,
        isActive
      })
      toast.success(
        isActive ? 'Đã kích hoạt danh mục' : 'Đã vô hiệu hóa danh mục'
      )
      onClearSelection()
      await onRefresh()
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  return (
    <div className='fixed left-1/2 top-4/5 z-50 -translate-x-1/2 rounded-lg border border-red-800 bg-red-100 p-4 shadow-lg'>
      <div className='flex flex-col items-center gap-4 sm:flex-row'>
        <Tag
          icon={<CheckCircleOutlined />}
          variant='outlined'
          color='blue'
          className='font-semibold text-gray-700 text-nowrap h-8! items-center flex!'
        >
          {selectedIds.length} danh mục được chọn
        </Tag>
        <Button onClick={() => void handleBulkActiveChange(true)}>
          Kích hoạt đã chọn
        </Button>
        <Button onClick={() => void handleBulkActiveChange(false)}>
          Vô hiệu hóa đã chọn
        </Button>
      </div>
    </div>
  )
}
