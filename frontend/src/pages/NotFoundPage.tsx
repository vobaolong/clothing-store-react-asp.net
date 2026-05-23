import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { isAdmin } from '@/state/auth-session'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-4 text-center bg-slate-50'>
      {/* Big 404 */}
      <div className='relative mb-6 select-none'>
        <span className='text-[10rem] font-black leading-none text-slate-100 sm:text-[14rem]'>
          404
        </span>
        <span className='absolute inset-0 flex items-center justify-center text-6xl sm:text-8xl'>
          😵
        </span>
      </div>

      <h1 className='mb-3 text-2xl font-bold text-slate-800 sm:text-3xl'>
        Trang không tồn tại
      </h1>
      <p className='max-w-md mb-8 text-base text-slate-500'>
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển đến
        địa chỉ khác.
      </p>

      <div className='flex flex-wrap justify-center gap-3'>
        <Button
          size='large'
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Button
          type='primary'
          size='large'
          icon={<HomeOutlined />}
          onClick={() =>
            navigate(isAdmin() ? '/admin' : '/', { replace: true })
          }
        >
          Về trang chủ
        </Button>
      </div>
    </div>
  )
}
