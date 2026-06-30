import { Modal } from 'antd'
import ReviewForm from '@/components/reviews/ReviewForm'
import type { MyOrderItem } from '@/types/order.type'

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
  return (
    <Modal
      title={
        item?.productName
          ? `Đánh giá "${item.productName}"`
          : 'Đánh giá sản phẩm'
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
