import {
  EnvironmentOutlined,
  HeartOutlined,
  LogoutOutlined,
  MenuOutlined,
  OrderedListOutlined,
  ShoppingOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Badge, Button, Drawer, Dropdown, Input, Layout } from 'antd'
import type { MenuProps } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Category } from '@/types'
import { toProductsCategorySearchUrl } from '@/utils/category-tree'
import { NotificationCenter } from '@/components/NotificationCenter'
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility'
import AnnouncementBar from './AnnouncementBar'
import ThemeToggleButton from '@/components/ThemeToggleButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { lp } from '@/utils/language-path'

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

const PROFILE_ROUTES: Record<string, string> = {
  profile: lp('/profile'),
  'profile-wishlist': lp('/profile?tab=wishlist'),
  'profile-orders': lp('/profile?tab=orders'),
  'profile-addresses': lp('/profile?tab=addresses')
}

function useCategoryGroups(categories: Category[]): CategoryGroup[] {
  return useMemo(() => {
    const childrenByParent = categories.reduce<Record<string, Category[]>>(
      (acc, item) => {
        if (!item.parentId) return acc
        ;(acc[item.parentId] ??= []).push(item)
        return acc
      },
      {}
    )

    return categories
      .filter((c) => !c.parentId)
      .map((parent) => ({
        parent,
        children: (childrenByParent[parent.id] ?? []).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
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
    'dark:text-slate-300 dark:hover:text-white'
  ].join(' ')
}

function MegaMenuContent({
  categoryGroups
}: {
  categoryGroups: CategoryGroup[]
}) {
  return (
    <div className="p-6 bg-white rounded-xl border shadow-xl border-slate-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categoryGroups.map(({ parent, children }) => (
          <div key={parent.id}>
            <Link
              to={toProductsCategorySearchUrl(parent)}
              className="text-sm font-semibold text-slate-900! hover:underline! hover:text-slate-600! dark:text-slate-100! dark:hover:text-slate-300!"
            >
              {parent.name}
            </Link>
            <div className="flex flex-col gap-2 mt-3 text-sm text-slate-600 dark:text-slate-400">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={toProductsCategorySearchUrl(child)}
                  className="transition-colors hover:text-slate-900 text-slate-900! hover:underline! underline-offset-4 dark:text-slate-100! dark:hover:text-slate-300!"
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
  onSearch
}: {
  selectedRootPath: string
  categoryGroups: CategoryGroup[]
  searchKeyword: string
  onSearchChange: (v: string) => void
  onSearch: () => void
}) {
  const { t } = useTranslation()

  const navItems = [
    { key: '/', label: t('header.navHome') },
    { key: '/products', label: t('header.navProducts') },
    { key: '/about', label: t('header.navAbout') }
  ]

  return (
    <div className="hidden flex-1 justify-evenly items-center md:flex">
      <div className="flex gap-5 items-center">
        {navItems.map((item) => {
          const isActive = selectedRootPath === item.key
          const showMegaMenu =
            item.key === '/products' && categoryGroups.length > 0

          const link = (
            <Link to={lp(item.key)} className={navLinkClass(isActive)}>
              {item.label}
            </Link>
          )
          return (
            <div key={item.key}>
              {showMegaMenu ? (
                <Dropdown
                  trigger={['hover']}
                  placement="bottomLeft"
                  popupRender={() => (
                    <MegaMenuContent categoryGroups={categoryGroups} />
                  )}
                >
                  {link}
                </Dropdown>
              ) : (
                link
              )}
            </div>
          )
        })}
      </div>
      <Search
        value={searchKeyword}
        onChange={(e) => onSearchChange(e.target.value)}
        onSearch={onSearch}
        placeholder={t('header.searchPlaceholder')}
        className="w-56! justify-end items-end"
        allowClear
      />
    </div>
  )
}

function MobileNavDrawer({
  open,
  categoryGroups,
  onClose
}: {
  open: boolean
  categoryGroups: CategoryGroup[]
  onClose: () => void
}) {
  const { t } = useTranslation()

  const navItems = [
    { key: '/', label: t('header.navHome') },
    { key: '/products', label: t('header.navProducts') },
    { key: '/about', label: t('header.navAbout') }
  ]

  return (
    <Drawer
      title={t('header.menuTitle')}
      placement="left"
      onClose={onClose}
      open={open}
    >
      <div className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.key}
            to={lp(item.key)}
            className="text-base font-medium text-slate-900! dark:text-slate-100! dark:hover:text-slate-300! hover:underline! underline-offset-4! hover:text-slate-600"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}

        <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
          <p className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            {t('header.categoriesTitle')}
          </p>
          <div className="flex flex-col gap-2">
            {categoryGroups.map(({ parent, children }) => (
              <div key={parent.id}>
                <Link
                  to={toProductsCategorySearchUrl(parent)}
                  className="text-sm font-medium text-slate-900! dark:text-slate-100! dark:hover:text-slate-300! hover:underline! underline-offset-4! hover:text-slate-600"
                  onClick={onClose}
                >
                  {parent.name}
                </Link>
                <div className="flex flex-col gap-3 mt-1 ml-3">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      to={toProductsCategorySearchUrl(child)}
                      className="text-xs text-slate-600! hover:text-slate-900! dark:text-slate-400! dark:hover:text-slate-100!"
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

export default function AppHeader({
  isAdminUser,
  isAuthenticated,
  itemCount,
  categories,
  selectedRootPath,
  onCartClick,
  onLogout
}: AppHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const visible = useHeaderVisibility({ disabled: isAdminUser })

  const categoryGroups = useCategoryGroups(categories)

  const userMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'profile',
        label: t('header.userProfile'),
        icon: <UserOutlined />
      },
      {
        key: 'profile-wishlist',
        label: t('header.userWishlist'),
        icon: <HeartOutlined />
      },
      {
        key: 'profile-orders',
        label: t('header.userOrders'),
        icon: <OrderedListOutlined />
      },
      {
        key: 'profile-addresses',
        label: t('header.userAddresses'),
        icon: <EnvironmentOutlined />
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: t('header.logout'),
        danger: true,
        icon: <LogoutOutlined />
      }
    ],
    [t]
  )

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') return onLogout()
    navigate(PROFILE_ROUTES[key] ?? key)
  }

  const handleSearch = () => {
    const keyword = searchKeyword.trim()
    navigate(
      keyword
        ? lp(`/products?search=${encodeURIComponent(keyword)}`)
        : lp('/products')
    )
  }

  const handleCartClick = () =>
    onCartClick ? onCartClick() : navigate(lp('/cart'))

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-white transition-transform duration-300 ease-in-out mx-auto dark:bg-gray-900 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {!isAdminUser && <AnnouncementBar />}
      <Header className="bg-white border-b border-slate-200 px-4! md:px-8! dark:bg-gray-900! dark:border-gray-700!">
        <div className="flex items-center w-full gap-4 mx-auto h-18 max-w-7xl">
          <Link
            to={isAdminUser ? lp('/admin') : lp('/')}
            className="hidden md:block text-2xl font-semibold tracking-tight text-slate-900! dark:text-white!"
          >
            Wearly
          </Link>

          {!isAdminUser && (
            <>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                className="inline-flex md:hidden!"
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

          <div className="flex gap-2 items-center ml-auto shrink-0">
            <LanguageSwitcher />
            <ThemeToggleButton />
            {!isAdminUser && (
              <Button
                type="text"
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                icon={
                  <Badge count={itemCount} size="small" offset={[6, -5]}>
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
                menu={{ items: userMenuItems, onClick: handleMenuClick }}
                destroyOnHidden
              >
                <Button
                  type="text"
                  className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  icon={<UserOutlined />}
                />
              </Dropdown>
            ) : (
              <Button
                type="text"
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                icon={<UserOutlined />}
                onClick={() => navigate(lp('/login'))}
              />
            )}
          </div>
        </div>
      </Header>
    </div>
  )
}
