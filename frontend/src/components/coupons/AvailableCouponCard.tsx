import { Modal, Radio } from 'antd'
import { useState } from 'react'
import type { AvailableCoupon } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { formatCouponDiscount } from '@/utils/coupon-discount'
import { useTranslation } from 'react-i18next'

type AvailableCouponCardProps = {
  coupon: AvailableCoupon
  isSelected: boolean
  isEligible: boolean
  isApplyingCoupon: boolean
  onApply: (code: string) => void
}

export default function AvailableCouponCard({
  coupon,
  isSelected,
  isEligible,
  isApplyingCoupon,
  onApply
}: AvailableCouponCardProps) {
  const { t } = useTranslation()
  const [isConditionOpen, setIsConditionOpen] = useState(false)

  const remainingUsage =
    coupon.maxUsage > 0 ? Math.max(0, coupon.maxUsage - coupon.usedCount) : 0

  const isExhausted = coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage
  const isBelowMin = !isEligible && !isExhausted
  const isDisabled = !isEligible || isApplyingCoupon

  const apply = () => {
    if (isDisabled) return
    onApply(coupon.code)
  }

  const openCondition = (e?: {
    stopPropagation: () => void
    preventDefault: () => void
  }) => {
    e?.preventDefault()
    e?.stopPropagation()
    setIsConditionOpen(true)
  }

  return (
    <>
      <div
        role="button"
        aria-disabled={isDisabled}
        tabIndex={0}
        onClick={apply}
        onKeyDown={(e) => {
          if (isDisabled) return
          if (e.key === 'Enter' || e.key === ' ') apply()
        }}
        className={`relative h-full min-h-26.75 cursor-pointer rounded-lg card pl-6 pr-4.5 transition ${
          isDisabled ? 'opacity-70 cursor-not-allowed!' : 'hover:shadow-sm'
        } before:absolute before:left-0 before:top-1/2 before:h-6.5 before:w-6 before:translate-x-[-53%] before:-translate-y-1/2 before:rounded-full before:bg-light`}
      >
        <div className="relative flex h-full min-h-26.75 flex-1 flex-col justify-between border-l border-dashed border-l-neutral-900/20 dark:border-l-neutral-100 py-2 pl-3">
          <div className="flex justify-between space-y-1">
            <div className="basis-3/4">
              <p className="flex items-baseline gap-0.5 text-base">
                {coupon.code}
                {coupon.maxUsage > 0 && (
                  <span className="block text-[10px] font-normal leading-none">
                    ({t('common.remaining', { count: remainingUsage })})
                  </span>
                )}
              </p>
              <p className="text-xs line-clamp-3">
                {t('coupon.couponDescription', {
                  discount: formatCouponDiscount(coupon),
                  minOrder: formatCurrency(coupon.minOrderSubtotal)
                })}
              </p>
            </div>

            <div
              role="radiogroup"
              aria-required="false"
              dir="ltr"
              className="absolute right-4.5 grid gap-2 top-1/2 -translate-y-1/2"
              tabIndex={0}
              style={{ outline: 'none' }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  tabIndex={0}
                  aria-label={t('common.condition')}
                  onClick={(e) => openCondition(e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openCondition()
                  }}
                >
                  <Radio checked={isSelected} disabled />
                </div>

                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => openCondition(e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openCondition()
                  }}
                  className="text-[11px] font-semibold text-blue-800 dark:text-blue-400 cursor-pointer select-none"
                  aria-label="Mở điều kiện áp dụng coupon"
                >
                  {t('coupon.condition')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-auto">
            <p className="font-sans text-xs text-slate-900 dark:text-white">
              HSD: {formatDate(coupon.expiresAt, 'dateOnlyUTC')}
            </p>
            {isBelowMin && (
              <p className="font-sans text-[11px] text-amber-700">
                {t('coupon.minOrderValueError')}
              </p>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={isConditionOpen}
        title={coupon.code}
        onCancel={() => setIsConditionOpen(false)}
        footer={null}
        width={420}
        centered
        destroyOnHidden
        okText={t('common.close')}
        cancelText={t('common.cancel')}
      >
        <div className="space-y-2">
          <p className="font-semibold">{t('coupon.details')}</p>
          <p className="text-[13px] text-slate-600">
            {t('coupon.usageWarning')}
          </p>
          <p className="text-[13px] text-slate-600">
            {t('coupon.couponDescription', {
              discount: formatCouponDiscount(coupon),
              minOrder: formatCurrency(coupon.minOrderSubtotal)
            })}
          </p>
          <p className="text-[12px] text-slate-500">
            HSD: {formatDate(coupon.expiresAt, 'dateOnlyUTC')}
          </p>

          <div className="pt-2">
            <p className="text-[12px] font-semibold">{t('common.condition')}</p>
            <ul className="mt-1 space-y-1 text-[12px] text-slate-600 list-disc pl-4">
              <li>{t('coupon.nonCash')}</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}
