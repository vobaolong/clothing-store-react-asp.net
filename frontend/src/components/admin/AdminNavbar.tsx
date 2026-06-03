import {
  CommentOutlined,
  TeamOutlined,
  DashboardOutlined,
  FolderOutlined,
  InboxOutlined,
  PictureOutlined,
  SkinOutlined,
  TagsOutlined
} from '@ant-design/icons'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AdminNavKey, isAdminNavKey } from '@/enums'
import { ADMIN_NAV_LABELS } from '@/constants/labels.constant'

type AdminNavbarProps = {
  inlineCollapsed: boolean
}

const navItems: MenuProps['items'] = [
  {
    key: AdminNavKey.DASHBOARD,
    icon: <DashboardOutlined />,
    label: ADMIN_NAV_LABELS.DASHBOARD
  },
  {
    key: AdminNavKey.PRODUCTS,
    icon: <SkinOutlined />,
    label: ADMIN_NAV_LABELS.PRODUCTS
  },
  {
    key: AdminNavKey.CATEGORIES,
    icon: <FolderOutlined />,
    label: ADMIN_NAV_LABELS.CATEGORIES
  },
  {
    key: AdminNavKey.ORDERS,
    icon: <InboxOutlined />,
    label: ADMIN_NAV_LABELS.ORDERS
  },
  {
    key: AdminNavKey.REVIEWS,
    icon: <CommentOutlined />,
    label: ADMIN_NAV_LABELS.REVIEWS
  },
  {
    key: AdminNavKey.CUSTOMERS,
    icon: <TeamOutlined />,
    label: ADMIN_NAV_LABELS.CUSTOMERS
  },
  {
    key: AdminNavKey.COUPONS,
    icon: <TagsOutlined />,
    label: ADMIN_NAV_LABELS.COUPONS
  },
  {
    key: AdminNavKey.BANNERS,
    icon: <PictureOutlined />,
    label: ADMIN_NAV_LABELS.BANNERS
  }
]

export default function AdminNavbar({ inlineCollapsed }: AdminNavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { section } = useParams<{ section: string }>()
  const selectedKey = location.pathname.startsWith('/admin/orders/')
    ? AdminNavKey.ORDERS
    : section && isAdminNavKey(section)
      ? section
      : AdminNavKey.DASHBOARD

  return (
    <Menu
      mode="inline"
      inlineCollapsed={inlineCollapsed}
      selectedKeys={[selectedKey]}
      items={navItems}
      onClick={({ key }) => navigate(`/admin/${String(key)}`)}
      className="px-2 pb-4 bg-transparent border-0"
    />
  )
}
