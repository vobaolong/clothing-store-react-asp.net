import { Card, Descriptions } from 'antd'
import { formatDate, formatStructuredAddress } from '@/utils/format'
import { getVietnameseLabel } from '@/constants/i18n.constant'
import type { MyOrderDetail } from '@/types/order.type'

interface OrderDetailInfoCardProps {
  detail: MyOrderDetail
}

export default function OrderDetailInfoCard({
  detail
}: OrderDetailInfoCardProps) {
  return (
    <Card className="rounded-2xl" title="Thông tin đơn hàng">
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Mã đơn hàng">
          {detail.id.slice(0, 8).toUpperCase()}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày mua">
          {formatDate(detail.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {getVietnameseLabel(detail.status)}
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {detail.paymentMethod}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
          {getVietnameseLabel(detail.paymentStatus)}
        </Descriptions.Item>
        <Descriptions.Item label="Tên người nhận">
          {detail.shippingName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại người nhận">
          {detail.shippingPhone || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ người nhận">
          {formatStructuredAddress(detail)}
        </Descriptions.Item>
        {detail.note && (
          <Descriptions.Item label="Ghi chú">{detail.note}</Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  )
}
