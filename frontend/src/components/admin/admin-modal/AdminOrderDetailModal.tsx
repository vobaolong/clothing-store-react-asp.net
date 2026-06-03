import { useQuery } from '@tanstack/react-query'
import { Card, Descriptions, Empty, Modal, Spin, Table, Tag } from 'antd'
import { getAdminOrderDetail } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { formatCurrency, formatDate } from '@/utils/format'
import { getOrderStatusLabel } from '@/constants/labels.constant'
import { toCapitalize } from '@/utils/table.lib'
import { useMemo } from 'react'
import type { ColumnsType } from 'antd/es/table'

const formatStructuredAddress = (detail: {
  shippingStreet?: string
  shippingWard?: string
  shippingProvince?: string
  shippingAddress?: string
}) => {
  const structured = [
    detail.shippingStreet,
    detail.shippingWard,
    detail.shippingProvince
  ]
    .filter((x) => Boolean(x && x.trim()))
    .join(', ')
  return structured || detail.shippingAddress || '-'
}

type Props = {
  open: boolean
  orderId: string | null
  onClose: () => void
}

interface OrderItem {
  id: string
  lineTotal: number
  productName: string
  variantSize: string
  variantColor: string
  quantity: number
  unitPrice: number
}

export default function AdminOrderDetailModal({
  open,
  orderId,
  onClose
}: Props) {
  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.adminOrderDetail(orderId ?? undefined),
    queryFn: () => getAdminOrderDetail(String(orderId)),
    enabled: open && Boolean(orderId)
  })

  const detail = detailQuery.data

  const subtotal = useMemo(() => {
    return detail?.items.reduce((sum, item) => sum + item.lineTotal, 0) ?? 0
  }, [detail?.items])

  const shippingFee = useMemo(() => {
    if (!detail) return 0
    return Math.max(
      detail.totalAmount - subtotal + (detail.discountAmount || 0),
      0
    )
  }, [detail, subtotal])

  const columns = useMemo<ColumnsType<OrderItem>>(
    () => [
      {
        title: '#',
        key: 'stt',
        align: 'center',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1
      },
      {
        title: 'Sản phẩm',
        dataIndex: 'productName',
        key: 'productName',
        render: (value: string) => toCapitalize(value)
      },
      {
        title: 'Phân loại',
        key: 'variant',
        align: 'right',
        render: (_, row) =>
          row.variantSize
            ? `${toCapitalize(row.variantSize)} / ${toCapitalize(row.variantColor)}`
            : toCapitalize(row.variantColor)
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right'
      },
      {
        title: 'Đơn giá',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'lineTotal',
        key: 'lineTotal',
        align: 'right',
        render: (value: number) => formatCurrency(value)
      }
    ],
    []
  )

  return (
    <Modal
      title="Order Detail"
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      destroyOnHidden
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
    >
      {detailQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : detailQuery.error || !detail ? (
        <p className="py-8 text-center text-slate-600">
          Không tìm thấy đơn hàng.
        </p>
      ) : (
        <div className="space-y-4!">
          <Card className="rounded-2xl" size="small">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="ID đơn hàng">
                {detail.id.slice(0, 8).toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(detail.createdAt)}
              </Descriptions.Item>
              {detail.updatedAt ? (
                <Descriptions.Item label="Cập nhật gần nhất">
                  {formatDate(detail.updatedAt)}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="Khách hàng">
                {detail.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {detail.userEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag>{getOrderStatusLabel(detail.status)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {detail.paymentMethod} - <Tag>{detail.paymentStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tên người nhận">
                {detail.shippingName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {detail.shippingPhone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {formatStructuredAddress(detail)}
              </Descriptions.Item>
              {detail.note ? (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {detail.note}
                </Descriptions.Item>
              ) : null}
            </Descriptions>
          </Card>

          <Card className="rounded-2xl" title="Items" size="small">
            <Table<OrderItem>
              rowKey="id"
              pagination={false}
              dataSource={detail.items}
              columns={columns}
              size="small"
              locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
            />
          </Card>

          <Card className="rounded-2xl" title="Tổng kết" size="small">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tổng tiền hàng</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span className="text-emerald-600">
                  -{formatCurrency(detail.discountAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 font-semibold border-t border-slate-200">
                <span>Tổng tiền</span>
                <span>{formatCurrency(detail.totalAmount)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Modal>
  )
}
