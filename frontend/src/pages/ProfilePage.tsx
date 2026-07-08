import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Drawer, FloatButton, Input, Skeleton, Spin } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { getMyProfile } from '@/api/profile-api'
import ProfileSidebar from '@/components/profile/ProfileSidebar'
import NotificationsSection from '@/components/profile/NotificationsSection'
import PasswordDialog from '@/components/profile/PasswordDialog'
import AddressList from '@/components/profile/AddressList'
import WishlistList from '@/components/profile/WishlistList'
import OrderList from '@/components/profile/OrderList'
import { getAuthToken } from '@/state/auth/auth-session'
import { lp } from '@/utils/language-path'

type Section = 'profile' | 'addresses' | 'wishlist' | 'orders' | 'notifications'

const PROFILE_SECTIONS: readonly Section[] = [
  'profile',
  'addresses',
  'wishlist',
  'orders',
  'notifications'
]

function isProfileSection(value: string | null): value is Section {
  return value != null && PROFILE_SECTIONS.includes(value as Section)
}

function profileSectionPath(section: Section): string {
  return section === 'profile' ? lp('/profile') : lp(`/profile?tab=${section}`)
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const token = getAuthToken()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isMobileSectionDrawerOpen, setIsMobileSectionDrawerOpen] =
    useState(false)

  const tab = searchParams.get('tab')
  const section: Section = isProfileSection(tab) ? tab : 'profile'

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const { data: profile, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myProfile,
    queryFn: getMyProfile,
    enabled: Boolean(token)
  })

  const handleSectionChange = (nextSection: Section) => {
    setIsMobileSectionDrawerOpen(false)
    navigate(profileSectionPath(nextSection))
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
        title={t('profile.pageTitle')}
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
              <h1 className="text-2xl font-semibold">{t('profile.accountSettings')}</h1>

              {isLoading ? (
                <div className="mt-4 space-y-7">
                  <div className="space-y-3">
                    <Skeleton active paragraph={{ rows: 1 }} className="w-24!" />
                    <Skeleton active className="h-10!" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton active paragraph={{ rows: 1 }} className="w-32!" />
                    <Skeleton active className="h-10!" />
                    <Skeleton active className="h-10 w-40!" />
                  </div>
                </div>
              ) : (
              <div className="mt-4 border-t divide-y divide-slate-200 border-slate-200">
                <section className="grid lg:gap-8 sm:gap-2 py-7 lg:grid-cols-[320px_1fr] lg:items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{t('profile.profile')}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {t('profile.personalInfo')}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      {t('profile.fullName')}
                    </label>
                    <Input
                      value={profile?.fullName ?? '-'}
                      readOnly
                      disabled
                      className="h-10 rounded-md border-slate-300 bg-slate-50 text-slate-700"
                    />
                  </div>
                </section>

                <section className="grid lg:gap-8 sm:gap-2 py-7 lg:grid-cols-[320px_1fr] lg:items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{t('profile.accountSecurity')}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {t('profile.loginInfo')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        {t('profile.email')}
                      </label>
                      <Input
                        value={profile?.email ?? '-'}
                        readOnly
                        disabled
                        className="h-10 rounded-md border-slate-300 bg-slate-50 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        {t('profile.password')}
                      </label>
                      <Button
                        className="h-10 px-5 rounded-md border-slate-300"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        {t('profile.changePassword')}
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
              )}
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
