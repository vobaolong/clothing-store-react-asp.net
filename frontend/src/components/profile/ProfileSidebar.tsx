import { Menu } from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  HeartOutlined,
  ShoppingOutlined,
  BellOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

type Props = {
  value: 'profile' | 'addresses' | 'wishlist' | 'orders' | 'notifications'
  onChange: (v: Props['value']) => void
}

export default function ProfileSidebar({ value, onChange }: Props) {
  const { t } = useTranslation()
  const menuItems = [
    { key: 'profile', label: t('profile.profile'), icon: <UserOutlined /> },
    { key: 'addresses', label: t('profile.shippingAddresses'), icon: <HomeOutlined /> },
    { key: 'wishlist', label: t('profile.wishlist'), icon: <HeartOutlined /> },
    { key: 'orders', label: t('order.order'), icon: <ShoppingOutlined /> },
    { key: 'notifications', label: t('profile.notifications'), icon: <BellOutlined /> }
  ]

  return (
    <Menu
      className="sticky border rounded-lg top-6 border-slate-200 dark:border-slate-600"
      items={menuItems}
      selectedKeys={[value]}
      onClick={({ key }) => onChange(key as Props['value'])}
      mode="vertical"
    />
  )
}
