import { Button, Empty, Table } from 'antd'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/utils/format'
import type { MyOrderItem } from '@/types/order.type'

interface OrderDetailItemsTableProps {
  items: MyOrderItem[]
  onReview: (itemId: string) => void
}

export default function OrderDetailItemsTable({
  items,
  onReview
}: OrderDetailItemsTableProps) {
  return (
    <Table
      rowKey="id"
      className="rounded-md overflow-hidden"
      pagination={false}
      dataSource={items}
      locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
      columns={[
        {
          title: 'Sản phẩm',
          dataIndex: 'productName',
          render: (_, row) => (
            <Link
              to={`/products/${row.productSlug}`}
              className="flex gap-2 items-center text-black! dark:text-white! hover:text-blue-500! dark:hover:text-blue-400! line-clamp-2 max-w-56"
            >
              <img
                src={row.imageUrl}
                alt="Product"
                className="object-cover rounded size-16"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              {row.productName}
            </Link>
          )
        },
        {
          title: 'Loại',
          render: (_, row) =>
            `${row.variantColor}${row.variantSize ? ` / ${row.variantSize}` : ''}`
        },
        {
          title: 'Đơn giá',
          dataIndex: 'unitPrice',
          align: 'right',
          render: (value: number) => formatCurrency(value)
        },
        { title: 'Số lượng', dataIndex: 'quantity', align: 'right' },
        {
          title: 'Thành tiền',
          dataIndex: 'lineTotal',
          align: 'right',
          render: (value: number) => formatCurrency(value)
        },
        {
          title: 'Đánh giá',
          align: 'center',
          render: (_, row) =>
            row.hasReviewed ? (
              <span className="text-xs font-medium text-emerald-600">
                Đã đánh giá
              </span>
            ) : row.canReview ? (
              <Button
                size="small"
                className="rounded-lg"
                onClick={() => onReview(row.id)}
              >
                Đánh giá
              </Button>
            ) : (
              <span className="text-xs text-slate-400">Chưa thể đánh giá</span>
            )
        }
      ]}
    />
  )
}
