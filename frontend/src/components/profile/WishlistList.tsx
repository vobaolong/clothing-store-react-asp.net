import { Card, Empty, Spin } from 'antd'
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <Empty description='Bạn chưa có sản phẩm nào trong danh sách yêu thích.' />
      </Card>
    )
  }

  return (
    <Card>
      <h3 className='mb-6 text-lg font-medium capitalize'>
        Danh Sách Yêu Thích Của Tôi ({data?.length || 0})
      </h3>
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {data.map((product: Product) => (
          <div key={product.id} className='relative group'>
            <ProductCard product={product} mode='catalog' />
          </div>
        ))}
      </div>
    </Card>
  )
}
