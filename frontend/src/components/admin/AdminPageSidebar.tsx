import { LogoutOutlined } from '@ant-design/icons'
import { Button, Layout, Tooltip, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import AdminNavbar from '@/components/admin/AdminNavbar'

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
  const { t } = useTranslation()

  return (
    <Sider
      width={240}
      collapsedWidth={64}
      theme="light"
      breakpoint="lg"
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapsedChange}
      className="border-r border-slate-200 [&_.ant-layout-sider-children]:flex [&_.ant-layout-sider-children]:min-h-0 [&_.ant-layout-sider-children]:flex-1 [&_.ant-layout-sider-children]:flex-col [&_.ant-layout-sider-trigger]:border-t [&_.ant-layout-sider-trigger]:border-slate-200 dark:border-gray-700 [&_.ant-layout-sider-trigger]:dark:border-gray-700 [&_.ant-layout-sider-trigger]:bg-white! [&_.ant-layout-sider-trigger]:dark:bg-[#192037]!"
    >
      <div className="flex flex-col flex-1 min-h-0">
        {!collapsed ? (
          <div className="px-4 pt-5 pb-2 bg-white! dark:bg-[#192037]!">
            <Typography.Title
              level={5}
              className="mb-0! mt-0! text-slate-900 dark:text-white"
            >
              {brandTitle}
            </Typography.Title>
          </div>
        ) : null}
        <div className="flex-1 min-h-0 overflow-y-auto bg-white! dark:bg-[#192037]!">
          <AdminNavbar inlineCollapsed={collapsed} />
        </div>
        <div className="flex justify-center p-2 border-t shrink-0 border-slate-200 dark:border-gray-700 bg-white! dark:bg-[#192037]!">
          <Tooltip title={collapsed ? t('admin.brandTitle') : undefined}>
            <Button
              danger
              type="default"
              block={!collapsed}
              icon={<LogoutOutlined />}
              className={collapsed ? 'flex w-full justify-center px-0!' : ''}
              onClick={onLogout}
            >
              {!collapsed ? t('confirm.logoutOk') : null}
            </Button>
          </Tooltip>
        </div>
      </div>
    </Sider>
  )
}
