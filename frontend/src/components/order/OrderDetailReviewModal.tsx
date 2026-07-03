import { Modal } from 'antd'
import ReviewForm from '@/components/reviews/ReviewForm'
import type { MyOrderItem } from '@/types/order.type'
import { useTranslation } from 'react-i18next'

interface OrderDetailReviewModalProps {
  item: MyOrderItem | null
  loading: boolean
  onSubmit: (values: {
    rating: number
    comment?: string
    tags?: string[]
  }) => Promise<void>
  onCancel: () => void
}

export default function OrderDetailReviewModal({
  item,
  loading,
  onSubmit,
  onCancel
}: OrderDetailReviewModalProps) {
  const { t } = useTranslation()
  return (
    <Modal
      title={
        item?.productName
          ? `${t('product.reviews')}"${item.productName}"`
          : t('product.productReviews')
      }
      open={Boolean(item)}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      {item ? (
        <ReviewForm loading={loading} onSubmit={onSubmit} onCancel={onCancel} />
      ) : null}
    </Modal>
  )
}
