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
  onRefresh,
}: Props) {
  const handleBulkActiveChange = async (isActive: boolean) => {
    try {
      await bulkUpdateCategoriesActive({
        ids: selectedIds,
        isActive,
      })
      toast.success(
        isActive ? 'Đã kích hoạt danh mục' : 'Đã vô hiệu hóa danh mục',
      )
      onClearSelection()
      await onRefresh()
    } catch {
      toast.error('Cập nhật thất bại')
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
