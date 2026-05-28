import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  addToWishlist,
  getWishlistProducts,
  removeFromWishlist
} from '@/api/wishlist-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { Product } from '@/types'
import { getAuthToken } from '@/state/auth/auth-session'

type WishlistContext = {
  previous: Product[]
}

export function useWishlist() {
  const queryClient = useQueryClient()
  const token = getAuthToken()
  const wishlistQuery = useQuery({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: getWishlistProducts,
    enabled: Boolean(token)
  })

  const wishlistProducts = wishlistQuery.data ?? []

  const isWishlisted = (productId: string) =>
    wishlistProducts.some((product) => product.id === productId)

  const addMutation = useMutation({
    mutationFn: async (product: Product) => {
      await addToWishlist(product.id)
      return product
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.wishlist })
      const previous =
        queryClient.getQueryData<Product[]>(QUERY_KEYS.wishlist) ?? []
      queryClient.setQueryData<Product[]>(
        QUERY_KEYS.wishlist,
        (current = []) => {
          if (current.some((item) => item.id === product.id)) return current
          return [product, ...current]
        }
      )
      return { previous } satisfies WishlistContext
    },
    onError: (_error, _product, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.wishlist, context.previous)
      }
      toast.error('Không thể thêm vào danh sách yêu thích!')
    },
    onSuccess: () => {
      toast.success('Đã thêm vào danh sách yêu thích!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist })
    }
  })

  const removeMutation = useMutation({
    mutationFn: async (product: Product) => {
      await removeFromWishlist(product.id)
      return product
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.wishlist })
      const previous =
        queryClient.getQueryData<Product[]>(QUERY_KEYS.wishlist) ?? []
      queryClient.setQueryData<Product[]>(QUERY_KEYS.wishlist, (current = []) =>
        current.filter((item) => item.id !== product.id)
      )
      return { previous } satisfies WishlistContext
    },
    onError: (_error, _product, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.wishlist, context.previous)
      }
      toast.error('Không thể xóa khỏi danh sách yêu thích!')
    },
    onSuccess: () => {
      toast.success('Đã xóa khỏi danh sách yêu thích!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist })
    }
  })

  const toggleWishlist = (product: Product) => {
    if (isWishlisted(product.id)) {
      removeMutation.mutate(product)
      return
    }
    addMutation.mutate(product)
  }

  return {
    wishlistQuery,
    wishlistProducts,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist: (product: Product) => removeMutation.mutate(product),
    isMutating: addMutation.isPending || removeMutation.isPending,
    isAuthenticated: Boolean(token)
  }
}
