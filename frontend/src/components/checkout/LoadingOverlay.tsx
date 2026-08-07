import { Spin } from 'antd'
import { useTranslation } from 'react-i18next'

export default function LoadingOverlay({
  isSubmitting
}: {
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  if (!isSubmitting) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-1000 bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spin size="large" />
        <div className="text-sm text-white">{t('checkout.processingPayment')}</div>
      </div>
    </div>
  )
}
