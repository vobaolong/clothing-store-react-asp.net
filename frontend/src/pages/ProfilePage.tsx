import { useState } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Drawer, FloatButton, Input, Spin } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { getMyProfile } from '@/api/profile-api'
import ProfileSidebar from '@/components/profile/ProfileSidebar'
import NotificationsSection from '@/components/profile/NotificationsSection'
import PasswordDialog from '@/components/profile/PasswordDialog'
import AddressList from '@/components/profile/AddressList'
import WishlistList from '@/components/profile/WishlistList'
import OrderList from '@/components/profile/OrderList'
import { getAuthToken } from '@/state/auth/auth-session'

type Section = 'profile' | 'addresses' | 'wishlist' | 'orders' | 'notifications'

export default function ProfilePage() {
  const token = getAuthToken()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobileSectionDrawerOpen, setIsMobileSectionDrawerOpen] =
    useState(false)

  const section: Section = (() => {
    if (location.pathname === '/profile/notifications') return 'notifications'
    const tab = searchParams.get('tab')
    if (
      tab === 'addresses' ||
      tab === 'wishlist' ||
      tab === 'orders' ||
      tab === 'notifications'
    )
      return tab
    return 'profile'
  })()

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const { data: profile, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myProfile,
    queryFn: getMyProfile,
    enabled: Boolean(token)
  })

  const handleSectionChange = (nextSection: Section) => {
    setIsMobileSectionDrawerOpen(false)

    if (nextSection === 'notifications') {
      navigate('/profile/notifications')
      return
    }

    if (nextSection === 'profile') {
      if (location.pathname === '/profile/notifications') {
        navigate('/profile')
        return
      }
      setSearchParams({})
      return
    }

    setSearchParams({ tab: nextSection })
  }

  if (!token) return <Navigate to="/login" replace />

  return (
    <div>
      <FloatButton
        icon={<MenuOutlined />}
        type="primary"
        style={{ bottom: 24, right: 24 }}
        onClick={() => setIsMobileSectionDrawerOpen(true)}
        className="sm:hidden!"
      />

      <Drawer
        title="Trang cá nhân"
        placement="bottom"
        onClose={() => setIsMobileSectionDrawerOpen(false)}
        open={isMobileSectionDrawerOpen}
        size="auto"
        className="sm:hidden"
      >
        <ProfileSidebar value={section} onChange={handleSectionChange} />
      </Drawer>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="hidden sm:block sm:w-48 md:w-54 shrink-0">
          <ProfileSidebar value={section} onChange={handleSectionChange} />
        </div>

        <div className="flex-1 min-w-0">
          {section === 'profile' && (
            <Card>
              <h1 className="text-2xl font-semibold text-slate-900">
                Cài đặt tài khoản
              </h1>

              <div className="mt-4 border-t divide-y divide-slate-200 border-slate-200">
                <section className="grid lg:gap-8 sm:gap-2 py-7 lg:grid-cols-[320px_1fr] lg:items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Hồ sơ
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Cài đặt thông tin cá nhân
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-900">
                      Họ và tên
                    </label>
                    {isLoading ? (
                      <Spin />
                    ) : (
                      <Input
                        value={profile?.fullName ?? '-'}
                        readOnly
                        disabled
                        className="h-10 rounded-md border-slate-300 bg-slate-50 text-slate-700"
                      />
                    )}
                  </div>
                </section>

                <section className="grid lg:gap-8 sm:gap-2 py-7 lg:grid-cols-[320px_1fr] lg:items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Bảo mật tài khoản
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Thông tin để đăng nhập vào tài khoản của bạn
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-900">
                        Email
                      </label>
                      <Input
                        value={profile?.email ?? '-'}
                        readOnly
                        disabled
                        className="h-10 rounded-md border-slate-300 bg-slate-50 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-900">
                        Mật khẩu
                      </label>
                      <Button
                        className="h-10 px-5 rounded-md border-slate-300 text-slate-900"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        Đổi mật khẩu
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </Card>
          )}
          {section === 'addresses' && <AddressList />}
          {section === 'wishlist' && <WishlistList />}
          {section === 'orders' && <OrderList />}
          {section === 'notifications' && <NotificationsSection />}
        </div>
      </div>
      <PasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
      />
    </div>
  )
}
