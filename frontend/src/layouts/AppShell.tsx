import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Drawer, Empty, Layout, Modal } from 'antd'
import toast from 'react-hot-toast'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Footer from '@/components/AppFooter'
import AppHeader from '@/components/AppHeader'
import { getCategories } from '@/api/products-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import {
	closeCartDrawer,
	selectCartItemCount,
	selectCartItems,
	selectIsCartDrawerOpen,
	openDrawer,
	removeFromCart,
	updateQuantity
} from '@/state/cart-slice'
import { formatCurrency } from '@/utils/format'
import { getCartLineImage } from '@/utils/product-color-images'
import { getCartLineEffectivePrice } from '@/utils/product-pricing'
import CartQuantityControl from '@/components/CartQuantityControl'
import { logout, selectAuth } from '@/state/auth'

const { Content } = Layout

export default function AppShell() {
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useDispatch()
	const { isAuthenticated, user } = useSelector(selectAuth)
	const isAdminUser = user?.isAdmin === true

	const categoriesQuery = useQuery({
		queryKey: QUERY_KEYS.categories,
		queryFn: getCategories,
		enabled: !isAdminUser
	})
	const cartItems = useSelector(selectCartItems)
	const isCartDrawerOpen = useSelector(selectIsCartDrawerOpen)
	const itemCount = useSelector(selectCartItemCount)
	const cartTotal = cartItems.reduce(
		(sum, item) => sum + getCartLineEffectivePrice(item) * item.quantity,
		0
	)

	const handleLogout = () => {
		Modal.confirm({
			title: 'Xác nhận đăng xuất',
			icon: <ExclamationCircleOutlined />,
			content: 'Bạn có chắc chắn muốn đăng xuất?',
			okText: 'Đăng xuất',
			cancelText: 'Hủy',
			okButtonProps: { danger: true },
			onOk: () => {
				dispatch(logout())
				toast.success('Đăng xuất thành công')
				navigate('/')
			}
		})
	}

	const selectedRootPath = location.pathname.startsWith('/products')
		? '/products'
		: location.pathname === '/'
			? '/'
			: `/${location.pathname.split('/')[1]}`

	return (
		<div className="flex flex-col overflow-hidden min-h-dvh bg-slate-50 dark:bg-gray-950">
			<AppHeader
				isAdminUser={isAdminUser}
				isAuthenticated={isAuthenticated}
				itemCount={itemCount}
				selectedRootPath={selectedRootPath}
				onCartClick={() => dispatch(openDrawer())}
				onLogout={handleLogout}
				categories={categoriesQuery.data ?? []}
			/>
			<Content className="flex-1 min-h-[90vh]! mx-auto w-full pb-8 lg:pt-30 pt-18 md:px-8! px-4">
				<div className="w-full gap-4 pt-4 mx-auto max-w-7xl">
					<Outlet />
				</div>
			</Content>
			{!isAdminUser && <Footer />}

			<Drawer
				title="Giỏ hàng"
				placement="right"
				size={420}
				open={isCartDrawerOpen}
				onClose={() => dispatch(closeCartDrawer())}
			>
				{!cartItems.length ? (
					<Empty description="Giỏ hàng của bạn trống" />
				) : (
					<div className="flex flex-col h-full min-h-0">
						<div className="flex flex-col flex-1 min-h-0 gap-4 pr-1 overflow-y-auto">
							{cartItems.map((item) => {
								const thumb = getCartLineImage(item).trim()
								return (
									<div
										key={`${item.id}-${item.productVariantId}`}
										className="flex flex-col gap-3 pb-4 border-b border-slate-100 sm:flex-row sm:items-start sm:justify-between dark:border-gray-700"
									>
										<div className="flex flex-1 min-w-0 gap-3">
											{thumb ? (
												<img
													src={thumb}
													alt={item.name}
													className="object-cover border rounded-lg size-16 shrink-0 border-slate-200 bg-slate-100 dark:border-gray-600"
													onError={(e) => {
														e.currentTarget.style.display = 'none'
													}}
												/>
											) : (
												<div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[9px] text-slate-400 dark:border-gray-600 dark:bg-gray-800">
													—
												</div>
											)}
											<div className="flex-1 min-w-0">
												<div className="font-medium text-slate-900 dark:text-slate-100">
													{item.name}
												</div>
												<div className="mt-1 text-sm text-slate-500">
													{item.selectedColor}
													{item.selectedSize
														? ` / ${item.selectedSize}`
														: ''} —{' '}
													{formatCurrency(getCartLineEffectivePrice(item))}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<CartQuantityControl
												value={item.quantity}
												onChange={(quantity) =>
													dispatch(
														updateQuantity({
															id: item.id,
															productVariantId: item.productVariantId,
															quantity
														})
													)
												}
												max={
													item.variants?.find(
														(variant) => variant.id === item.productVariantId
													)?.quantity ?? undefined
												}
											/>
											<Button
												danger
												icon={<DeleteOutlined />}
												onClick={() =>
													dispatch(
														removeFromCart({
															id: item.id,
															productVariantId: item.productVariantId
														})
													)
												}
											/>
										</div>
									</div>
								)
							})}
						</div>

						<div className="pt-4 mt-auto border-t shrink-0 border-slate-200 dark:border-gray-700">
							<div className="flex items-center justify-between mb-3 text-slate-700 dark:text-slate-300">
								<span>Tổng cộng</span>
								<span className="text-lg font-semibold text-slate-900 dark:text-white">
									{formatCurrency(cartTotal)}
								</span>
							</div>
							<Button
								type="primary"
								block
								onClick={() => {
									dispatch(closeCartDrawer())
									navigate('/cart')
								}}
							>
								Xem giỏ hàng
							</Button>
						</div>
					</div>
				)}
			</Drawer>
		</div>
	)
}
