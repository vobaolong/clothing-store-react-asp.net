import {
  EnvironmentOutlined,
  GiftOutlined,
  HeartOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  OrderedListOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  TruckOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Badge, Button, Drawer, Dropdown, Input, Layout } from 'antd'
import type { MenuProps } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Category } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'
import { NotificationCenter } from '@/components/NotificationCenter'
import { useHeaderVisibility } from '@/hooks/use-header-visibility'

export type AppHeaderProps = {
  isAdminUser: boolean
  isAuthenticated: boolean
  itemCount: number
  categories: Category[]
  selectedRootPath: string
  onCartClick?: () => void
  onLogout: () => void
}

type CategoryGroup = {
  parent: Category
  children: Category[]
}

const { Header } = Layout
const { Search } = Input

const NAV_ITEMS = [
  { key: '/', label: 'Trang chủ' },
  { key: '/products', label: 'Sản phẩm' },
  { key: '/about', label: 'Về Wearly' },
]

const PROFILE_ROUTES: Record<string, string> = {
  profile: '/profile',
  'profile-wishlist': '/profile?tab=wishlist',
  'profile-orders': '/profile?tab=orders',
  'profile-addresses': '/profile?tab=addresses',
}

const USER_MENU_ITEMS: MenuProps['items'] = [
  { key: 'profile', label: 'Thông tin tài khoản', icon: <UserOutlined /> },
  {
    key: 'profile-wishlist',
    label: 'Danh sách yêu thích',
    icon: <HeartOutlined />,
  },
  {
    key: 'profile-orders',
    label: 'Danh sách đơn hàng',
    icon: <OrderedListOutlined />,
  },
  {
    key: 'profile-addresses',
    label: 'Danh sách địa chỉ',
    icon: <EnvironmentOutlined />,
  },
  { type: 'divider' },
  { key: 'logout', label: 'Đăng xuất', danger: true, icon: <LogoutOutlined /> },
]

function useCategoryGroups(categories: Category[]): CategoryGroup[] {
  return useMemo(() => {
    const childrenByParent = categories.reduce<Record<string, Category[]>>(
      (acc, item) => {
        if (!item.parentId) return acc
        ;(acc[item.parentId] ??= []).push(item)
        return acc
      },
      {},
    )

    return categories
      .filter((c) => !c.parentId)
      .map((parent) => ({
        parent,
        children: (childrenByParent[parent.id] ?? []).sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }))
      .filter((g) => g.children.length > 0)
      .sort((a, b) => a.parent.name.localeCompare(b.parent.name))
  }, [categories])
}

function navLinkClass(isActive: boolean) {
  return [
    'inline-flex items-center h-9 px-3 text-base font-medium rounded-none! bg-transparent! border-none! shadow-none! transition-colors text-nowrap',
    'text-slate-700 hover:text-slate-900 hover:bg-transparent! hover:underline! underline-offset-6 decoration-2',
    isActive
      ? 'underline! underline-offset-6! decoration-2 text-slate-900'
      : '',
  ].join(' ')
}

function MegaMenuContent({
  categoryGroups,
}: {
  categoryGroups: CategoryGroup[]
}) {
  return (
    <div className='p-6 bg-white border shadow-xl rounded-xl border-slate-200'>
      <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {categoryGroups.map(({ parent, children }) => (
          <div key={parent.id}>
            <Link
              to={toProductsCategorySearchUrl(parent)}
              className='text-sm font-semibold text-slate-900! hover:underline! hover:text-slate-600!'
            >
              {parent.name}
            </Link>
            <div className='flex flex-col gap-2 mt-3 text-sm text-slate-600'>
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={toProductsCategorySearchUrl(child)}
                  className='transition-colors hover:text-slate-900 text-slate-900! hover:underline! underline-offset-4'
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesktopNav({
  selectedRootPath,
  categoryGroups,
  searchKeyword,
  onSearchChange,
  onSearch,
}: {
  selectedRootPath: string
  categoryGroups: CategoryGroup[]
  searchKeyword: string
  onSearchChange: (v: string) => void
  onSearch: () => void
}) {
  return (
    <div className='items-center flex-1 hidden justify-evenly md:flex'>
      <div className='flex items-center gap-5'>
        {NAV_ITEMS.map((item) => {
          const isActive = selectedRootPath === item.key
          const showMegaMenu =
            item.key === '/products' && categoryGroups.length > 0

          return (
            <div key={item.key}>
              {showMegaMenu ? (
                <Dropdown
                  trigger={['hover']}
                  placement='bottomLeft'
                  popupRender={() => (
                    <MegaMenuContent categoryGroups={categoryGroups} />
                  )}
                >
                  <Link to={item.key} className={navLinkClass(isActive)}>
                    {item.label}
                  </Link>
                </Dropdown>
              ) : (
                <Link to={item.key} className={navLinkClass(isActive)}>
                  {item.label}
                </Link>
              )}
            </div>
          )
        })}
      </div>
      <Search
        value={searchKeyword}
        onChange={(e) => onSearchChange(e.target.value)}
        onSearch={onSearch}
        placeholder='Tìm sản phẩm...'
        className='w-56! justify-end items-end'
        allowClear
      />
    </div>
  )
}

function MobileNavDrawer({
  open,
  categoryGroups,
  onClose,
}: {
  open: boolean
  categoryGroups: CategoryGroup[]
  onClose: () => void
}) {
  return (
    <Drawer title='Menu' placement='left' onClose={onClose} open={open}>
      <div className='flex flex-col gap-4'>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            to={item.key}
            className='text-base font-medium text-slate-900 hover:text-slate-600'
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}

        <div className='pt-4 border-t border-slate-200'>
          <p className='mb-3 text-sm font-semibold text-slate-600'>Danh mục</p>
          <div className='flex flex-col gap-2'>
            {categoryGroups.map(({ parent, children }) => (
              <div key={parent.id}>
                <Link
                  to={toProductsCategorySearchUrl(parent)}
                  className='text-sm font-medium text-slate-900 hover:text-slate-600'
                  onClick={onClose}
                >
                  {parent.name}
                </Link>
                <div className='flex flex-col gap-1 mt-1 ml-3'>
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      to={toProductsCategorySearchUrl(child)}
                      className='text-xs text-slate-600 hover:text-slate-900'
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}

function AnnouncementBar() {
  return (
    <div className='hidden bg-[#2f2f2f] px-4 py-1 text-center text-xs text-white md:flex md:text-sm justify-evenly p-2!'>
      <span>
        <TruckOutlined className='me-1' /> Miễn phí vận chuyển cho đơn từ
        499.000K
      </span>
      <span>
        <GiftOutlined className='me-1' /> Ưu đãi đến 20% cho thành viên mới
      </span>
      <span className='gap-2'>
        <PhoneOutlined className='me-1' /> Hotline: 0123 456 789
        <span className='px-4!'>|</span>
        <MailOutlined className='me-1' /> support@wearly.com
      </span>
    </div>
  )
}

export default function AppHeader({
  isAdminUser,
  isAuthenticated,
  itemCount,
  categories,
  selectedRootPath,
  onCartClick,
  onLogout,
}: AppHeaderProps) {
  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const visible = useHeaderVisibility({ disabled: isAdminUser })

  const categoryGroups = useCategoryGroups(categories)

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') return onLogout()
    navigate(PROFILE_ROUTES[key] ?? key)
  }

  const handleSearch = () => {
    const keyword = searchKeyword.trim()
    navigate(
      keyword ? `/products?search=${encodeURIComponent(keyword)}` : '/products',
    )
  }

  const handleCartClick = () =>
    onCartClick ? onCartClick() : navigate('/cart')

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-white transition-transform duration-300 ease-in-out mx-auto ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {!isAdminUser && <AnnouncementBar />}
      <Header className='bg-white! border-b border-slate-200 px-4! md:px-8!'>
        <div className='flex items-center w-full gap-4 mx-auto h-18 max-w-7xl px-4! md:px-8!'>
          <Link
            to={isAdminUser ? '/admin' : '/'}
            className='hidden md:block text-2xl font-semibold tracking-tight text-slate-900!'
          >
            Wearly
          </Link>

          {!isAdminUser && (
            <>
              <Button
                type='text'
                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                className='inline-flex md:hidden!'
                onClick={() => setIsDrawerOpen(true)}
              />
              <DesktopNav
                selectedRootPath={selectedRootPath}
                categoryGroups={categoryGroups}
                searchKeyword={searchKeyword}
                onSearchChange={setSearchKeyword}
                onSearch={handleSearch}
              />
              <MobileNavDrawer
                open={isDrawerOpen}
                categoryGroups={categoryGroups}
                onClose={() => setIsDrawerOpen(false)}
              />
            </>
          )}

          <div className='flex items-center gap-2 ml-auto shrink-0'>
            {!isAdminUser && (
              <Button
                type='default'
                className='h-9 rounded-md! border-slate-300 px-4 text-slate-700 hover:border-slate-400 hover:text-slate-900'
                icon={
                  <Badge count={itemCount} size='small' offset={[3, -2]}>
                    <ShoppingOutlined />
                  </Badge>
                }
                onClick={handleCartClick}
              />
            )}

            {isAuthenticated && <NotificationCenter />}

            {isAuthenticated ? (
              <Dropdown
                trigger={['click']}
                menu={{ items: USER_MENU_ITEMS, onClick: handleMenuClick }}
                destroyOnHidden
              >
                <Button
                  className='h-9 rounded-md! border-slate-300 px-3 text-slate-700 hover:border-slate-400 hover:text-slate-900'
                  icon={<UserOutlined />}
                />
              </Dropdown>
            ) : (
              <Button
                type='default'
                className='h-9 rounded-md! border-slate-300 px-4 text-slate-700 hover:border-slate-400 hover:text-slate-900'
                icon={<UserOutlined />}
                onClick={() => navigate('/login')}
              />
            )}
          </div>
        </div>
      </Header>
    </div>
  )
}
