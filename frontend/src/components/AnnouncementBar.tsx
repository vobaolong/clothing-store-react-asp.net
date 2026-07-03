import {
  GiftOutlined,
  MailOutlined,
  PhoneOutlined,
  TruckOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

export default function AnnouncementBar() {
  const { t } = useTranslation()
  return (
    <div className="hidden bg-[#2f2f2f] px-4 text-center text-xs text-white md:flex md:text-sm justify-between md:px-8! py-3!">
      <span>
        <TruckOutlined className="me-1" /> {t('announcement.freeShippingPromo')}
      </span>
      <span>
        <GiftOutlined className="me-1" /> {t('announcement.newMemberPromo')}
      </span>
      <span className="gap-2">
        <PhoneOutlined className="me-1" /> Hotline: 0123 456 789
        <span className="px-4!">|</span>
        <MailOutlined className="me-1" /> support@wearly.com
      </span>
    </div>
  )
}
