const SHIPPING_FEE = 30000
const FREE_SHIPPING_THRESHOLD = 499000

const formatShippingAddress = (address: {
  street?: string
  ward?: string
  province?: string
  address?: string
}) => {
  const structured = [address.street, address.ward, address.province]
    .filter((x) => Boolean(x && x.trim()))
    .join(', ')
  return structured || address.address || ''
}

const normalizeCouponCode = (couponCode?: string) =>
  couponCode?.trim().toUpperCase() ?? ''

const calculateFinalTotal = (subtotal: number, discountAmount: number) =>
  Math.max(
    subtotal -
      discountAmount +
      (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE),
    0,
  )

export {
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  formatShippingAddress,
  normalizeCouponCode,
  calculateFinalTotal,
}
