import { Suspense, lazy } from 'react'
import { Tabs } from 'antd'
import { toCapitalize } from '@/utils/table.lib'

const ProductReviewsSection = lazy(
  () => import('@/components/reviews/ProductReviewsSection')
)

interface ProductTabsProps {
  description: string
  productId: string
  productName: string
}

export default function ProductTabs({
  description,
  productId,
  productName
}: ProductTabsProps) {
  return (
    <div className="w-full mt-8 bg-white border rounded-lg border-stone-100">
      <Tabs
        className="[&_.ant-tabs-nav]:mb-6 [&_.ant-tabs-nav-wrap]:w-full [&_.ant-tabs-nav-list]:flex [&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:m-0 [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:justify-center [&_.ant-tabs-tab-btn]:w-full [&_.ant-tabs-tab-btn]:text-center [&_.ant-tabs-tab]:py-3 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:font-semibold [&_.ant-tabs-ink-bar]:h-0.5"
        defaultActiveKey="description"
        items={[
          {
            key: 'description',
            label: 'Mô tả sản phẩm',
            children: (
              <div className="px-4 py-3 md:px-6 md:py-4">
                <div
                  className="prose prose-sm max-w-none text-stone-600 [&_img]:h-auto [&_img]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )
          },
          {
            key: 'reviews',
            label: 'Đánh giá sản phẩm',
            children: (
              <div className="px-4 py-3 md:px-6 md:py-4">
                <Suspense fallback={null}>
                  <ProductReviewsSection
                    productId={productId}
                    productName={toCapitalize(productName)}
                  />
                </Suspense>
              </div>
            )
          }
        ]}
      />
    </div>
  )
}
