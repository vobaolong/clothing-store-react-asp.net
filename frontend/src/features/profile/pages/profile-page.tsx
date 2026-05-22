import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Spin } from 'antd'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getMyProfile } from '@/api/profile-api'
import ProfileSidebar from '@/features/profile/components/ProfileSidebar.tsx'
import NotificationsSection from '@/features/profile/components/NotificationsSection'
import PasswordDialog from '@/features/profile/components/PasswordDialog.tsx'
import AddressList from '@/features/profile/components/AddressList.tsx'
import WishlistList from '@/features/profile/components/WishlistList.tsx'
import OrderList from '@/features/profile/components/OrderList.tsx'
import { getAuthToken } from '@/state/auth-session'

type Section = 'profile' | 'addresses' | 'wishlist' | 'orders' | 'notifications'

export default function ProfilePage() {
	const token = getAuthToken()
	const location = useLocation()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

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

		if (location.pathname === '/profile/notifications') {
			navigate(`/profile?tab=${nextSection}`)
			return
		}

		setSearchParams({ tab: nextSection })
	}

	if (!token) return <Navigate to='/login' replace />

	return (
		<div className='py-6 md:py-10'>
			{/* Mobile: sidebar shown above content */}
			<div className='mb-4 sm:hidden'>
				<ProfileSidebar value={section} onChange={handleSectionChange} />
			</div>

			<div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
				<div className='hidden sm:block sm:w-48 md:w-54 shrink-0'>
					<ProfileSidebar value={section} onChange={handleSectionChange} />
				</div>

				<div className='min-w-0 flex-1'>
					{section === 'profile' && (
						<div>
							<h1 className='text-2xl font-semibold text-slate-900'>
								Cài đặt tài khoản
							</h1>

							<div className='mt-4 divide-y divide-slate-200 border-y border-slate-200'>
								<section className='grid gap-8 py-7 lg:grid-cols-[320px_1fr] lg:items-start'>
									<div>
										<h2 className='text-xl font-semibold text-slate-900'>
											Hồ sơ
										</h2>
										<p className='mt-2 text-sm text-slate-600'>
											Cài đặt thông tin cá nhân
										</p>
									</div>

									<div>
										<label className='mb-1 block text-sm font-medium text-slate-900'>
											Họ và tên
										</label>
										{isLoading ? (
											<Spin />
										) : (
											<Input
												value={profile?.fullName ?? '-'}
												readOnly
												disabled
												className='h-10 rounded-md border-slate-300 bg-slate-50 text-slate-700'
											/>
										)}
									</div>
								</section>

								<section className='grid gap-8 py-7 lg:grid-cols-[320px_1fr] lg:items-start'>
									<div>
										<h2 className='text-xl font-semibold text-slate-900'>
											Bảo mật tài khoản
										</h2>
										<p className='mt-2 text-sm text-slate-600'>
											Thông tin để đăng nhập vào tài khoản của bạn
										</p>
									</div>

									<div className='space-y-6'>
										<div>
											<label className='mb-1 block text-sm font-medium text-slate-900'>
												Email
											</label>
											<Input
												value={profile?.email ?? '-'}
												readOnly
												disabled
												className='h-10 rounded-md border-slate-300 bg-slate-50 text-slate-700'
											/>
										</div>

										<div>
											<label className='mb-1 block text-sm font-medium text-slate-900'>
												Mật khẩu
											</label>
											<Button
												className='h-10 rounded-md border-slate-300 px-5 text-slate-900'
												onClick={() => setShowPasswordDialog(true)}
											>
												Đổi mật khẩu
											</Button>
										</div>
									</div>
								</section>
							</div>
						</div>
					)}
					{section === 'addresses' && <AddressList />}
					{section === 'wishlist' && <WishlistList />}
					{section === 'orders' && <OrderList />}
					{section === 'notifications' && (
						// lazy-load notifications section
						<NotificationsSection />
					)}
				</div>
			</div>
			<PasswordDialog
				open={showPasswordDialog}
				onClose={() => setShowPasswordDialog(false)}
			/>
		</div>
	)
}
