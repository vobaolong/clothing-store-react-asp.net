import { LogoutOutlined } from '@ant-design/icons'
import { Button, Layout, Tooltip, Typography } from 'antd'

import AdminNavbar from '@/features/admin/components/admin-navbar'

const { Sider } = Layout

type AdminPageSidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  brandTitle: string
  onLogout: () => void
}

export default function AdminPageSidebar({
  collapsed,
  onCollapsedChange,
  brandTitle,
  onLogout
}: AdminPageSidebarProps) {
  return (
    <Sider
      width={240}
      collapsedWidth={64}
      theme='light'
      breakpoint='lg'
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapsedChange}
      className='border-r border-slate-200 [&_.ant-layout-sider-children]:flex [&_.ant-layout-sider-children]:min-h-0 [&_.ant-layout-sider-children]:flex-1 [&_.ant-layout-sider-children]:flex-col [&_.ant-layout-sider-trigger]:border-t [&_.ant-layout-sider-trigger]:border-slate-200'
    >
      <div className='flex min-h-0 flex-1 flex-col'>
        {!collapsed ? (
          <div className='px-4 pt-5 pb-2'>
            <Typography.Title level={5} className='mb-0! mt-0! text-slate-900'>
              {brandTitle}
            </Typography.Title>
          </div>
        ) : (
          <div className='h-3 shrink-0' aria-hidden />
        )}
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <AdminNavbar inlineCollapsed={collapsed} />
        </div>
        <div className='shrink-0 border-t border-slate-200 p-2'>
          <Tooltip title={collapsed ? 'Logout' : undefined}>
            <Button
              danger
              type='default'
              block={!collapsed}
              icon={<LogoutOutlined />}
              className={collapsed ? 'flex w-full justify-center px-0!' : ''}
              onClick={onLogout}
            >
              {!collapsed ? 'Đăng xuất' : null}
            </Button>
          </Tooltip>
        </div>
      </div>
    </Sider>
  )
}
