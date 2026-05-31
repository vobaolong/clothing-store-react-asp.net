import { Button } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'

type Props = {
  isOutOfStock: boolean
  selectedVariant?: {
    id: string
    size: string
    color: string
    hex: string
  }
  onAddToCart: () => void
  onBuyNow: () => void
}

export default function ProductPurchaseActions({
  isOutOfStock,
  selectedVariant,
  onAddToCart,
  onBuyNow
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
        type="default"
        disabled={isOutOfStock}
        onClick={onAddToCart}
        icon={<ShoppingOutlined />}
        size="large"
        className="w-full px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-stone-900 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Thêm vào giỏ
      </Button>

      <Button
        type="primary"
        disabled={isOutOfStock || !selectedVariant}
        onClick={onBuyNow}
        size="large"
        className="w-full px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Mua nhanh
      </Button>
    </div>
  )
}
