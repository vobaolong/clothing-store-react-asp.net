import { Spin } from 'antd'

export default function LoadingOverlay({
  isSubmitting
}: {
  isSubmitting: boolean
}) {
  if (!isSubmitting) return null
  return (
    <div className='fixed inset-0 z-1000 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none'>
      <div className='flex flex-col items-center gap-3'>
        <Spin size='large' />
        <div className='text-white text-sm'>Đang xử lý đơn hàng...</div>
      </div>
    </div>
  )
}
