export const QUERY_KEYS = {
  products: ['products'],
  categories: ['categories'],
  homepageBanners: ['homepage-banners'],
  availableCoupons: ['available-coupons'],
  shippingAddresses: ['shipping-addresses'],
  shippingAddressPrefill: ['shipping-address-prefill'],
  checkoutProvinces: ['checkout-provinces'],
  checkoutWardsByProvince: (provinceId?: string) => [
    'checkout-wards-by-province',
    provinceId
  ],
  myProfile: ['my-profile'],
  myOrders: (status?: string) => ['my-orders', status],
  myOrderDetail: (id?: string) => ['my-order-detail', id],
  wishlist: ['wishlist'],
  notifications: ['notifications'],
  notificationsList: (params?: unknown) => ['notifications', params],
  notificationsUnreadCount: ['notifications', 'unread-count'],
  productReviews: (productId?: string) => ['product-reviews', productId],
  adminProducts: ['admin-products'],
  adminProductsDeleted: ['admin-products', 'deleted'],
  adminCategories: ['admin-categories'],
  adminOrdersBase: ['admin-orders'],
  adminOrders: (status?: string) => ['admin-orders', status],
  adminReviews: ['admin-reviews'],
  adminCustomers: ['admin-customers'],
  adminCoupons: ['admin-coupons'],
  adminBanners: ['admin-banners'],
  adminRevenueKpi: ['admin-revenue-kpi'],
  adminOrderDetail: (id?: string) => ['admin-order-detail', id],
  vnpayReturn: (txnRef?: string | null, responseCode?: string | null) => [
    'vnpay-return',
    txnRef,
    responseCode
  ]
} as const
