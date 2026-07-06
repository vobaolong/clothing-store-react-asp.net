import { Drawer, Image, Typography, Descriptions } from 'antd'
import { formatCurrency, formatDate } from '@/utils/format'
import type { ProductView } from '@/types'
import { useCallback, useState } from 'react'
import { FALLBACK_IMG } from '@/constants/images.constant'
import { useTranslation } from 'react-i18next'

type ProductDrawerProps = {
  open: boolean
  product: ProductView | null
  onClose: () => void
}

export default function ProductDrawer({
  open,
  product,
  onClose
}: ProductDrawerProps) {
  const { t } = useTranslation()
  const [fallbackShown, setFallbackShown] = useState(false)

  const handleImgError = useCallback(() => {
    setFallbackShown(true)
  }, [])

  const displaySrc = (() => {
    if (!product?.imageUrl || fallbackShown) return FALLBACK_IMG
    return product.imageUrl
  })()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('admin.productViewTitle')}
      placement="right"
      size={500}
      destroyOnHidden
    >
      {product && (
        <div className="flex flex-col gap-5">
          <Image
            src={displaySrc}
            alt={product.name}
            className="object-cover rounded-xl border! border-slate-200!"
            preview={false}
            onError={handleImgError}
          />

          <div>
            <Typography.Title level={5} className="mb-1!">
              {t('admin.productViewName')}{' '}
              <span className="text-sm text-slate-600">{product.name}</span>
            </Typography.Title>
            {product.description && (
              <Typography.Title level={5}>
                {t('admin.productViewDesc')}{' '}
                <p
                  className="text-sm font-medium text-slate-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </Typography.Title>
            )}
          </div>

          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              {
                key: 'id',
                label: t('admin.productViewId'),
                children: (
                  <Typography.Paragraph
                    code
                    copyable
                    className="text-nowrap m-0!"
                  >
                    {product.id}
                  </Typography.Paragraph>
                )
              },
              {
                key: 'price',
                label: t('admin.productViewPrice'),
                children: (
                  <Typography.Paragraph strong className="m-0!">
                    {formatCurrency(product.price)}
                  </Typography.Paragraph>
                )
              },
              {
                key: 'category',
                label: t('admin.productViewCategory'),
                children: product.category
              },
              {
                key: 'createdAt',
                label: t('admin.productViewCreated'),
                children: formatDate(product.createdAt)
              },
              {
                key: 'updatedAt',
                label: t('admin.productViewUpdated'),
                children: formatDate(product.updatedAt)
              }
            ]}
          />
        </div>
      )}
    </Drawer>
  )
}
