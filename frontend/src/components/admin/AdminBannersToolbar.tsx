import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import {
  AdminQueryRefreshButton,
  type AdminRefreshQuery
} from '@/components/admin/AdminQueryRefreshButton'

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
  return (
    <div className='flex gap-2 justify-between items-center w-full bg-white p-3 rounded-lg shadow-xs'>
      <div>
        <h2 className='text-lg font-bold text-slate-800 m-0'>Quản lý Banner</h2>
        <p className='text-xs text-slate-500'>
          Kéo thả các hàng hoặc dùng mũi tên để sắp xếp thứ tự hiển thị của
          banner ngoài trang chủ.
        </p>
      </div>
      <div className='flex gap-2 items-center'>
        <AdminQueryRefreshButton query={query} />
        {hasOrderChanges && onSaveOrder && (
          <Button
            type='text'
            color='primary'
            variant='outlined'
            loading={isReordering}
            onClick={onSaveOrder}
          >
            Lưu thứ tự mới
          </Button>
        )}
        <Button type='primary' icon={<PlusOutlined />} onClick={onCreate}>
          Thêm banner
        </Button>
      </div>
    </div>
  )
}
