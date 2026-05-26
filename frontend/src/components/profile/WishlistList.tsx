import { Card, Divider, Empty, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getWishlistProducts } from '@/api/wishlist-api'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

export default function WishlistList() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: getWishlistProducts
  })

  if (isLoading) return <Spin className='flex justify-center py-12' />

  return (
    <Card>
      <h1 className='text-2xl font-medium m-0!'>
        Danh Sách Yêu Thích Của Tôi ({data?.length || 0})
      </h1>
      <Divider />
      <div className='flex justify-center'>
        {data.length === 0 && (
          <Empty description='Không có sản phẩm yêu thích' />
        )}
        {data.map((product: Product) => (
          <div key={product.id} className='relative group'>
            <ProductCard product={product} mode='catalog' />
          </div>
        ))}
      </div>
    </Card>
  )
}
