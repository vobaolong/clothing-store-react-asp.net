export const QUERY_KEYS = {
  products: ['products'] as const,
  categories: ['categories'] as const,
  homepageBanners: ['homepage-banners'] as const,
  availableCoupons: ['available-coupons'] as const,
  shippingAddresses: ['shipping-addresses'] as const,
  shippingAddressPrefill: ['shipping-address-prefill'] as const,
  checkoutProvinces: ['checkout-provinces'] as const,
  checkoutWardsByProvince: (provinceId?: string) =>
    ['checkout-wards-by-province', provinceId] as const,
  myProfile: ['my-profile'] as const,
  myOrders: (status?: string) => ['my-orders', status] as const,
  myOrderDetail: (id?: string) => ['my-order-detail', id] as const,
  wishlist: ['wishlist'] as const,
  notifications: ['notifications'] as const,
  notificationsList: (params?: unknown) => ['notifications', params] as const,
  notificationsUnreadCount: ['notifications', 'unread-count'] as const,
  productReviews: (productId?: string) =>
    ['product-reviews', productId] as const,
  adminProducts: ['admin-products'] as const,
  adminProductsDeleted: ['admin-products', 'deleted'] as const,
  adminCategories: ['admin-categories'] as const,
  adminOrdersBase: ['admin-orders'] as const,
  adminOrders: (status?: string) => ['admin-orders', status] as const,
  adminReviews: ['admin-reviews'] as const,
  adminCustomers: ['admin-customers'] as const,
  adminCoupons: ['admin-coupons'] as const,
  adminBanners: ['admin-banners'] as const,
  adminOrderDetail: (id?: string) => ['admin-order-detail', id] as const,
  vnpayReturn: (txnRef?: string | null, responseCode?: string | null) =>
    ['vnpay-return', txnRef, responseCode] as const
} as const
