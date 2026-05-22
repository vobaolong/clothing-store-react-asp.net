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
import { isAdmin, removeAuthToken } from '@/state/auth-session'
import { NotificationCenter } from '@/components/notification-center'
import AdminPageSidebar from '@/features/admin/components/admin-page-sidebar'

const { Header, Content } = Layout

export default function AdminShell() {
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

  if (!isAdmin()) return <Navigate to='/' replace />

  return (
    <Layout className='flex h-dvh overflow-hidden bg-white'>
      <AdminPageSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        brandTitle={ADMIN_PAGE_BRAND_TITLE}
        onLogout={handleLogout}
      />
      <Layout className='flex min-h-0 min-w-0 flex-1 flex-col'>
        {!isOrderDetailPage ? (
          <Header className='flex! h-auto! shrink-0 items-center! border-b! border-slate-200! bg-white! px-6! py-4! leading-normal!'>
            <Typography.Title level={4} className='m-0! flex-1'>
              {headerTitle}
            </Typography.Title>
            <NotificationCenter />
          </Header>
        ) : null}
        <Content className='min-h-0 flex-1 overflow-auto bg-slate-50/90! p-4 md:p-6'>
          <div className='min-w-0'>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
