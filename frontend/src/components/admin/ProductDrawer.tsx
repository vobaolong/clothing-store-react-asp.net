import { Drawer, Image, Typography, Descriptions } from 'antd'
import { formatCurrency, formatDate } from '@/utils/format'
import type { ProductView } from '@/types'
import { useCallback, useState } from 'react'
import { FALLBACK_IMG } from '@/utils/error-handler'

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
      title="Thông tin sản phẩm"
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
              Tên sản phẩm:{' '}
              <span className="text-sm text-slate-600">{product.name}</span>
            </Typography.Title>
            {product.description && (
              <Typography.Title level={5}>
                Mô tả:{' '}
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
                label: 'ID',
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
                label: 'Giá tiền',
                children: (
                  <Typography.Paragraph strong className="m-0!">
                    {formatCurrency(product.price)}
                  </Typography.Paragraph>
                )
              },
              {
                key: 'category',
                label: 'Phân loại',
                children: product.category
              },
              {
                key: 'createdAt',
                label: 'Ngày thêm',
                children: formatDate(product.createdAt)
              },
              {
                key: 'updatedAt',
                label: 'Cập nhật',
                children: formatDate(product.updatedAt)
              }
            ]}
          />
        </div>
      )}
    </Drawer>
  )
}
