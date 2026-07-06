import { Form } from 'antd'
import type { FormInstance } from 'antd'
import { useTranslation } from 'react-i18next'

type BannerPreviewPanelProps = {
  form: FormInstance
}

export default function BannerPreviewPanel({ form }: BannerPreviewPanelProps) {
  const { t } = useTranslation()
  const imageUrl = Form.useWatch('imageUrl', form) as string | undefined
  const cleanImageUrl = String(imageUrl ?? '').trim()

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg card">
      {cleanImageUrl ? (
        <img
          src={cleanImageUrl}
          alt="Banner preview"
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-slate-400">
          {t('admin.banners')}
        </div>
      )}
    </div>
  )
}
