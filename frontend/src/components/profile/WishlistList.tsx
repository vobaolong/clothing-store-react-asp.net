import { Card, Empty, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { getWishlistProducts } from '@/api/wishlist-api'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

export default function WishlistList() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: getWishlistProducts
  })

  if (isLoading) return <Spin className="flex justify-center py-12" />

  return (
    <Card>
      <h1 className="pb-6 mb-4 text-2xl font-semibold border-b border-slate-200">
        Danh Sách Yêu Thích Của Tôi ({data?.length || 0})
      </h1>
      {!data || data.length === 0 ? (
        <Empty description="Bạn chưa có sản phẩm nào trong danh sách yêu thích." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((product: Product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} mode="catalog" />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
