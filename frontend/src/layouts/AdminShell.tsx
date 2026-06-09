import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Layout, Modal, Typography } from 'antd'
import { createElement, useMemo, useState } from 'react'
import { Outlet, useLocation, useParams, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ADMIN_PAGE_BRAND_TITLE,
  ADMIN_PAGE_HEADER_TITLE
} from '@/constants/admin-nav.constant'
import { AdminNavKey, isAdminNavKey } from '@/enums'
import { isAdmin, removeAuthToken } from '@/state/auth/auth-session'
import { NotificationCenter } from '@/components/NotificationCenter'
import AdminPageSidebar from '@/components/admin/AdminPageSidebar'
import ThemeToggleButton from '@/components/ThemeToggleButton'
import { useTheme } from '@/hooks/useTheme'

const { Header, Content } = Layout

export default function AdminShell() {
  const { isDark: isDarkTheme } = useTheme()
  const { section } = useParams<{ section: string }>()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const isOrderDetailPage = location.pathname.startsWith('/admin/orders/')

  const headerTitle = useMemo(() => {
    if (section && isAdminNavKey(section)) {
      return ADMIN_PAGE_HEADER_TITLE[section as AdminNavKey]
    }

    return 'Admin'
  }, [section])

  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      icon: createElement(ExclamationCircleOutlined),
      content: 'Bạn có chắc chắn muốn đăng xuất?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        removeAuthToken()
        toast.success('Đăng xuất thành công')
        window.location.href = '/'
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
        brandTitle={ADMIN_PAGE_BRAND_TITLE}
        onLogout={handleLogout}
      />
      <Layout className="flex flex-col flex-1 min-w-0 min-h-0">
        {!isOrderDetailPage ? (
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
              Xin chào Admin Wearly
            </span>
            <ThemeToggleButton />
            <NotificationCenter />
          </Header>
        ) : null}
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
