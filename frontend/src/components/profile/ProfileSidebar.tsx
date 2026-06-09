import { Menu } from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  HeartOutlined,
  ShoppingOutlined,
  BellOutlined
} from '@ant-design/icons'

type Props = {
  value: 'profile' | 'addresses' | 'wishlist' | 'orders' | 'notifications'
  onChange: (v: Props['value']) => void
}

export default function ProfileSidebar({ value, onChange }: Props) {
  const menuItems = [
    { key: 'profile', label: 'Hồ sơ', icon: <UserOutlined /> },
    { key: 'addresses', label: 'Địa chỉ', icon: <HomeOutlined /> },
    { key: 'wishlist', label: 'Yêu thích', icon: <HeartOutlined /> },
    { key: 'orders', label: 'Đơn hàng', icon: <ShoppingOutlined /> },
    { key: 'notifications', label: 'Thông báo', icon: <BellOutlined /> }
  ]

  return (
    <Menu
      className="sticky top-6 rounded-lg border border-slate-200 dark:border-slate-600"
      items={menuItems}
      selectedKeys={[value]}
      onClick={({ key }) => onChange(key as Props['value'])}
      mode="vertical"
    />
  )
}
