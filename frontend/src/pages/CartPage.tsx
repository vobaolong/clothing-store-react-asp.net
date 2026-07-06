import { DeleteOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Empty, Modal, Select } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  toggleSelectAllCartItems,
  toggleSelectCartItem,
  updateCartVariant,
  updateQuantity
} from '@/state/cart-slice'
import CartQuantityControl from '@/components/CartQuantityControl'
import { formatCurrency } from '@/utils/format'
import { getCartLineImage } from '@/utils/product-color-images'
import { getCartLineEffectivePrice } from '@/utils/product-pricing'
import { SHIPPING_FEE } from '@/utils/checkout-utils'
import { lp } from '@/utils/language-path'

export default function CartPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const selectedItems = items.filter((item) => item.isSelected)
  const total = selectedItems.reduce(
    (sum, item) => sum + getCartLineEffectivePrice(item) * item.quantity,
    0
  )
  const shippingFee = selectedItems.length > 0 ? SHIPPING_FEE : 0
  const grandTotal = total + shippingFee
  const allSelected = items.length > 0 && items.every((item) => item.isSelected)

  const confirmRemoveItem = (id: string, productVariantId: string) => {
    Modal.confirm({
      title: t('cart.confirmDeleteItemTitle'),
      content: t('cart.confirmDeleteItemContent'),
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: () => dispatch(removeFromCart({ id, productVariantId }))
    })
  }

  const confirmClearCart = () => {
    Modal.confirm({
      title: t('cart.confirmClearCartTitle'),
      content: t('cart.confirmClearCartContent'),
      okText: t('cart.deleteAll'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: () => dispatch(clearCart())
    })
  }

  if (!items.length)
    return (
      <Card className="rounded-lg card w-full">
        <Empty description={t('cart.isEmpty')} className="py-12" />
        <div className="flex justify-center">
          <Link to={lp('/products')}>
            <Button type="primary">{t('cart.continueShopping')}</Button>
          </Link>
        </div>
      </Card>
    )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card
        className="rounded-lg card"
        title={<span className="text-xl font-semibold">{t('cart.cart')}</span>}
      >
        <div className="flex justify-between items-center p-3 mb-4 rounded-xl card">
          <Checkbox
            checked={allSelected}
            onChange={(event) =>
              dispatch(toggleSelectAllCartItems(event.target.checked))
            }
          >
            {t('cart.selectAll')}
          </Checkbox>
          <div className="flex gap-3 items-center">
            <span className="text-sm text-slate-500 dark:text-slate-300">
              {t('cart.selected')}: {selectedItems.length}/{items.length}
            </span>
            {selectedItems.length > 0 ? (
              <Button danger type="text" onClick={confirmClearCart}>
                {t('cart.deleteAll')}
              </Button>
            ) : null}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const lineImage = getCartLineImage(item)

            return (
              <div key={`${item.id}-${item.productVariantId}`} className="py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 gap-3 items-center">
                    <Checkbox
                      className="mt-1"
                      checked={item.isSelected}
                      onChange={(event) =>
                        dispatch(
                          toggleSelectCartItem({
                            id: item.id,
                            productVariantId: item.productVariantId,
                            isSelected: event.target.checked
                          })
                        )
                      }
                    />
                    {lineImage.trim() ? (
                      <img
                        src={lineImage}
                        alt={item.name}
                        className="object-cover rounded-xl border size-24 border-slate-200 bg-slate-100"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div
                        className="flex size-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400"
                        aria-hidden
                      >
                        {t('common.noImage')}
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">
                        {item.name}
                      </h3>
                      <span className="text-sm text-slate-500 dark:text-slate-300">
                        {item.selectedColor}
                        {item.selectedSize && ` / ${item.selectedSize}`}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Select
                          value={item.selectedColor}
                          style={{ width: 180 }}
                          options={(item.variants ?? [])
                            .filter(
                              (variant) =>
                                variant.size === item.selectedSize &&
                                variant.quantity > 0
                            )
                            .map((variant) => ({
                              value: variant.color,
                              label: variant.color
                            }))}
                          onChange={(colorValue) => {
                            const targetVariant = (item.variants ?? []).find(
                              (variant) =>
                                variant.size === item.selectedSize &&
                                variant.color === colorValue &&
                                variant.quantity > 0
                            )
                            if (!targetVariant) return
                            dispatch(
                              updateCartVariant({
                                id: item.id,
                                oldProductVariantId: item.productVariantId,
                                newProductVariantId: targetVariant.id,
                                selectedSize: targetVariant.size,
                                selectedColor: targetVariant.color
                              })
                            )
                          }}
                        />
                        {item.selectedSize && (
                          <Select
                            value={item.selectedSize}
                            style={{ width: 100 }}
                            options={Array.from(
                              new Set(
                                (item.variants ?? [])
                                  .filter((variant) => variant.quantity > 0)
                                  .map((variant) => variant.size)
                              )
                            ).map((size) => ({
                              value: size,
                              label: `${size}`
                            }))}
                            onChange={(sizeValue) => {
                              const targetVariant = (item.variants ?? []).find(
                                (variant) =>
                                  variant.size === sizeValue &&
                                  variant.color === item.selectedColor &&
                                  variant.quantity > 0
                              )
                              if (!targetVariant) return
                              dispatch(
                                updateCartVariant({
                                  id: item.id,
                                  oldProductVariantId: item.productVariantId,
                                  newProductVariantId: targetVariant.id,
                                  selectedSize: targetVariant.size,
                                  selectedColor: targetVariant.color
                                })
                              )
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <CartQuantityControl
                      value={item.quantity}
                      min={1}
                      max={
                        (item.variants ?? []).find(
                          (variant) => variant.id === item.productVariantId
                        )?.quantity ?? undefined
                      }
                      onChange={(quantity) =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            productVariantId: item.productVariantId,
                            quantity
                          })
                        )
                      }
                    />
                    <div className="font-semibold text-right min-w-30 text-slate-900 dark:text-slate-200">
                      {formatCurrency(
                        getCartLineEffectivePrice(item) * item.quantity
                      )}
                    </div>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        confirmRemoveItem(item.id, item.productVariantId)
                      }
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <aside className="sticky top-24 self-start p-5 rounded-lg card">
        <h2 className="mb-4 text-xl font-semibold">{t('checkout.orderSummary')}</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{t('cart.subtotal')}</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{t('cart.shippingFee')}</span>
            <span>{formatCurrency(shippingFee)}</span>
          </div>
          <div className="flex justify-between pt-3 mt-3 text-base font-semibold border-t border-slate-200">
            <span>{t('cart.total')}</span>
            <span className="text-slate-900 dark:text-slate-200">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
        <div className="grid gap-2 mt-5">
          <Link to={lp('/checkout')}>
            <Button
              type="primary"
              block
              size="large"
              disabled={selectedItems.length === 0}
            >
              {t('cart.proceedToCheckout')}
            </Button>
          </Link>
          <Link to={lp('/products')}>
            <Button block size="large">
              {t('cart.continueShopping')}
            </Button>
          </Link>
        </div>
      </aside>
    </div>
  )
}
