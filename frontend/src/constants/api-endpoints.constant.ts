export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp'
  },
  products: {
    list: '/products',
    bySlug: (slug: string) => `/products/${slug}`,
    categories: '/categories'
  },
  orders: {
    mine: '/orders/my',
    mineById: (id: string) => `/orders/my/${id}`,
    cancelMineById: (id: string) => `/orders/my/${id}/cancel`,
    byId: (id: string) => `/orders/${id}`,
    create: '/orders'
  },
  reviews: {
    byProduct: (id: string) => `/products/${id}/reviews`,
    root: '/reviews',
    byId: (id: string) => `/reviews/${id}`
  },
  account: {
    profile: '/profile/me',
    changePassword: '/profile/change-password',
    shippingAddresses: '/shipping-addresses',
    shippingAddressById: (id: string) => `/shipping-addresses/${id}`,
    shippingAddressDefaultById: (id: string) =>
      `/shipping-addresses/${id}/default`,
    shippingAddressPrefill: '/shipping-addresses/prefill'
  },
  wishlist: {
    root: '/wishlist',
    byProduct: (productId: string) => `/wishlist/${productId}`
  },
  coupons: {
    available: '/coupons/available',
    validate: '/coupons/validate',
    admin: '/coupons',
    adminById: (id: string) => `/coupons/${id}`,
    adminDeleted: '/coupons/deleted',
    adminBulkRestore: '/coupons/bulk-restore',
    adminRestoreById: (id: string) => `/coupons/${id}/restore`
  },
  banners: {
    active: '/banners/active'
  },
  notifications: {
    root: '/notifications',
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    unreadCount: '/notifications/unread-count'
  },
  uploads: {
    image: '/uploads/image'
  },
  payments: {
    vnpayCreateUrl: '/payments/vnpay/create-url',
    vnpayReturn: '/payments/vnpay/return'
  },
  admin: {
    products: '/admin/products',
    productsDeleted: '/admin/products/deleted',
    productsImport: '/admin/products/import',
    productsExport: '/admin/products/export',
    productsBulk: '/admin/products/bulk',
    productsBulkRestore: '/admin/products/bulk-restore',
    productsBulkPermanent: '/admin/products/bulk/permanent',
    productById: (id: string) => `/admin/products/${id}`,
    productPermanentById: (id: string) => `/admin/products/${id}/permanent`,
    productActiveById: (id: string) => `/admin/products/${id}/active`,
    productRestoreById: (id: string) => `/admin/products/${id}/restore`,
    categories: '/admin/categories',
    categoriesBulk: '/admin/categories/bulk',
    categoryById: (id: string) => `/admin/categories/${id}`,
    orders: '/admin/orders',
    ordersBulkStatus: '/admin/orders/bulk/status',
    orderById: (id: string) => `/admin/orders/${id}`,
    orderStatusById: (id: string) => `/admin/orders/${id}/status`,
    reviews: '/admin/reviews',
    reviewById: (id: string) => `/admin/reviews/${id}`,
    reviewsBulkDelete: '/admin/reviews/bulk-delete',
    customers: '/admin/customers',
    customerLockById: (id: string) => `/admin/customers/${id}/lock`,
    customerUnlockById: (id: string) => `/admin/customers/${id}/unlock`,
    banners: '/admin/banners',
    bannersReorder: '/admin/banners/reorder',
    bannerById: (id: string) => `/admin/banners/${id}`,
    revenueKpi: '/admin/kpi/revenue'
  }
} as const
