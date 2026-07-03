import {
  CommentOutlined,
  TeamOutlined,
  FolderOutlined,
  InboxOutlined,
  PictureOutlined,
  SkinOutlined,
  TagsOutlined,
  AreaChartOutlined
} from '@ant-design/icons'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { AdminNavKey, isAdminNavKey } from '@/enums'
import { lp } from '@/utils/language-path'

type AdminNavbarProps = {
  inlineCollapsed: boolean
}

const navItems = (t: TFunction): MenuProps['items'] => [
  {
    key: AdminNavKey.DASHBOARD,
    icon: <AreaChartOutlined />,
    label: t('admin.dashboard')
  },
  {
    key: AdminNavKey.PRODUCTS,
    icon: <SkinOutlined />,
    label: t('admin.products')
  },
  {
    key: AdminNavKey.CATEGORIES,
    icon: <FolderOutlined />,
    label: t('admin.categories')
  },
  {
    key: AdminNavKey.ORDERS,
    icon: <InboxOutlined />,
    label: t('admin.orders')
  },
  {
    key: AdminNavKey.REVIEWS,
    icon: <CommentOutlined />,
    label: t('admin.reviews')
  },
  {
    key: AdminNavKey.CUSTOMERS,
    icon: <TeamOutlined />,
    label: t('admin.customers')
  },
  {
    key: AdminNavKey.COUPONS,
    icon: <TagsOutlined />,
    label: t('admin.coupons')
  },
  {
    key: AdminNavKey.BANNERS,
    icon: <PictureOutlined />,
    label: t('admin.banners')
  }
]

export default function AdminNavbar({ inlineCollapsed }: AdminNavbarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { section } = useParams<{ section: string }>()
  const selectedKey = location.pathname.includes('/admin/orders/')
    ? AdminNavKey.ORDERS
    : section && isAdminNavKey(section)
      ? section
      : AdminNavKey.DASHBOARD

  return (
    <Menu
      mode="inline"
      inlineCollapsed={inlineCollapsed}
      selectedKeys={[selectedKey]}
      items={navItems(t)}
      onClick={({ key }) => navigate(lp(`/admin/${String(key)}`))}
      className="px-2 pb-4 border-0 bg-white! dark:bg-[#192037]!"
    />
  )
}
