import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Layout, Modal, Typography } from 'antd'
import { createElement, useMemo, useState } from 'react'
import { Outlet, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  ADMIN_PAGE_BRAND_TITLE_KEY,
  ADMIN_PAGE_HEADER_TITLE_KEYS
} from '@/constants/admin-nav.constant'
import { AdminNavKey, isAdminNavKey } from '@/enums'
import { isAdmin, removeAuthToken } from '@/state/auth/auth-session'
import { NotificationCenter } from '@/components/NotificationCenter'
import AdminPageSidebar from '@/components/admin/AdminPageSidebar'
import ThemeToggleButton from '@/components/ThemeToggleButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTheme } from '@/hooks/useTheme'
import { lp } from '@/utils/language-path'

const { Header, Content } = Layout

export default function AdminShell() {
  const { t } = useTranslation()
  const { isDark: isDarkTheme } = useTheme()
  const { section } = useParams<{ section: string }>()
  const [collapsed, setCollapsed] = useState(false)

  const headerTitle = useMemo(() => {
    if (section && isAdminNavKey(section)) {
      return t(ADMIN_PAGE_HEADER_TITLE_KEYS[section as AdminNavKey])
    }

    return t('admin.title')
  }, [section, t])

  const handleLogout = () => {
    Modal.confirm({
      title: t('confirm.logoutTitle'),
      icon: createElement(ExclamationCircleOutlined),
      content: t('confirm.logoutContent'),
      okText: t('confirm.logoutOk'),
      cancelText: t('confirm.cancel'),
      okButtonProps: { danger: true },
      onOk: () => {
        removeAuthToken()
        toast.success(t('confirm.logoutSuccess'))
        window.location.href = lp('/')
      }
    })
  }

  if (!isAdmin()) return <Navigate to="/" replace />

  return (
    <Layout
      className={`flex overflow-hidden h-dvh bg-white! ${isDarkTheme ? 'bg-[#192037]!' : 'bg-white!'}`}
    >
      <AdminPageSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        brandTitle={t(ADMIN_PAGE_BRAND_TITLE_KEY)}
        onLogout={handleLogout}
      />
      <Layout className="flex flex-col flex-1 min-w-0 min-h-0">
        <Header
          className={`flex h-auto shrink-0 items-center border-b p-4! md:p-6! ${
            isDarkTheme
              ? 'border-gray-700 bg-[#192037]!'
              : 'border-slate-200 bg-white!'
          }`}
        >
          <Typography.Title level={4} className="m-0! flex-1">
            {headerTitle}
          </Typography.Title>
          <span className="mr-3 dark:text-slate-300">
            {t('admin.greeting')}
          </span>
          <LanguageSwitcher />
          <ThemeToggleButton />
          <NotificationCenter />
        </Header>

        <Content
          className={`min-h-0 flex-1 overflow-auto p-4 md:p-6 ${
            isDarkTheme ? 'bg-gray-950/95' : 'bg-slate-50/90'
          }`}
        >
          <div className="min-w-0">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
