import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type AdminCustomerLockReasonOption = {
  label: string
  value: string
}

export const getAdminCustomerLockReasonOptions = (
  t: (key: string) => string
): AdminCustomerLockReasonOption[] => [
  {
    label: t('admin.lockReasons.termsViolation'),
    value: 'Vi phạm điều khoản sử dụng dịch vụ.'
  },
  {
    label: t('admin.lockReasons.suspectedFraud'),
    value: 'Hoạt động đáng ngờ / gian lận đơn hàng hoặc thanh toán.'
  },
  {
    label: t('admin.lockReasons.spamOrHarassment'),
    value: 'Spam, quấy rối hoặc nội dung không phù hợp.'
  },
  {
    label: t('admin.lockReasons.temporaryLockByPolicy'),
    value: 'Yêu cầu khóa tạm thời theo chính sách cửa hàng.'
  }
]

export const useAdminCustomerLockReasonOptions = () => {
  const { t } = useTranslation()

  return useMemo(
    () =>
      getAdminCustomerLockReasonOptions(
        (key: string) => t(key as never) as string
      ),
    [t]
  )
}
