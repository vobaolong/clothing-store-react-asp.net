import { HeartFilled, HeartOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useWishlist } from '@/hooks/useWishlist'
import type { Product } from '@/types'

export default function WishlistToggleButton({
  product,
  compact = false
}: {
  product: Product
  compact?: boolean
}) {
  const navigate = useNavigate()
  const { isAuthenticated, isWishlisted, toggleWishlist, isMutating } =
    useWishlist()

  const wishlisted = isWishlisted(product.id)

  return (
    <Tooltip
      title={
        wishlisted
          ? 'Xóa khỏi danh sách yêu thích'
          : 'Thêm vào danh sách yêu thích'
      }
    >
      <Button
        type='default'
        shape='circle'
        size={compact ? 'small' : 'middle'}
        className={`inline-flex items-center justify-center border-slate-200 ${wishlisted ? 'text-red-600! hover:border-red-300!' : 'text-slate-500! hover:border-slate-400!'}`}
        icon={wishlisted ? <HeartFilled /> : <HeartOutlined />}
        loading={isMutating}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!isAuthenticated) {
            navigate('/login')
            return
          }
          toggleWishlist(product)
        }}
      />
    </Tooltip>
  )
}
