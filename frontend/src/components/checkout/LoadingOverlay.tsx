import { Spin } from 'antd'

export default function LoadingOverlay({
  isSubmitting
}: {
  isSubmitting: boolean
}) {
  if (!isSubmitting) return null
  return (
    <div className='fixed inset-0 flex items-center justify-center pointer-events-none z-1000 bg-black/30 backdrop-blur-sm'>
      <div className='flex flex-col gap-3 items-center'>
        <Spin size='large' />
        <div className='text-sm text-white'>Đang xử lý đơn hàng...</div>
      </div>
    </div>
  )
}
