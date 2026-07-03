import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { isAdmin } from '@/state/auth/auth-session'
import { lp } from '@/utils/language-path'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-center items-center px-4 min-h-screen text-center bg-slate-50">
      <div className="relative mb-6 select-none">
        <span className="text-[10rem] font-black leading-none text-slate-100 sm:text-[14rem]">
          404
        </span>
        <span className="flex absolute inset-0 justify-center items-center text-6xl sm:text-8xl">
          😵
        </span>
      </div>

      <h1 className="mb-3 text-2xl font-bold text-slate-800 sm:text-3xl">
        {t('notFound.title')}
      </h1>
      <p className="mb-8 max-w-md text-base text-slate-500">
        {t('notFound.message')}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          {t('notFound.back')}
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() =>
            navigate(isAdmin() ? lp('/admin') : lp('/'), { replace: true })
          }
        >
          {t('notFound.goHome')}
        </Button>
      </div>
    </div>
  )
}
