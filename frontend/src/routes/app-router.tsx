import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import AdminShell from '@/layouts/AdminShell'
import AppShell from '@/layouts/AppShell'
import ScrollToTop from '@/components/scroll-to-top'
import { getAuthToken, isAdmin } from '@/state/auth-session'

const AboutPage = lazy(() => import('@/features/about/pages/about-page'))
const AdminPage = lazy(() => import('@/features/admin/pages/admin-page'))
const CartPage = lazy(() => import('@/features/cart/pages/cart-page'))
const CheckoutPage = lazy(
  () => import('@/features/checkout/pages/checkout-page')
)
const ForgotPasswordPage = lazy(
  () => import('@/features/auth/pages/forgot-password-page')
)
const HomePage = lazy(() => import('@/features/home/pages/home-page'))
const LoginPage = lazy(() => import('@/features/auth/pages/login-page'))
const OrderDetailPage = lazy(
  () => import('@/features/orders/pages/order-detail-page')
)
const AdminOrderDetailPage = lazy(
  () => import('@/features/admin/pages/admin-order-detail-page')
)
const PaymentReturnPage = lazy(
  () => import('@/features/checkout/pages/payment-return-page')
)
const ProductDetailPage = lazy(
  () => import('@/features/products/pages/product-detail-page')
)
const ProductsPage = lazy(
  () => import('@/features/products/pages/products-page')
)
const ProfilePage = lazy(() => import('@/features/profile/pages/profile-page'))
const RegisterPage = lazy(() => import('@/features/auth/pages/register-page'))
const ResetPasswordPage = lazy(
  () => import('@/features/auth/pages/reset-password-page')
)
const VerifyOtpPage = lazy(
  () => import('@/features/auth/pages/verify-otp-page')
)
const NotFoundPage = lazy(() => import('@/features/home/pages/not-found-page'))

function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

function AdminOnly({ children }: { children: ReactNode }) {
  const token = getAuthToken()
  if (!token) return <Navigate to='/login' replace />
  if (!isAdmin()) return <Navigate to='/' replace />
  return children
}

function CustomerOnly({ children }: { children: ReactNode }) {
  if (isAdmin()) return <Navigate to='/admin' replace />
  return children
}

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AdminShell />}>
          <Route
            path='/admin/orders/:id'
            element={
              <AdminOnly>
                <RouteSuspense>
                  <AdminOrderDetailPage />
                </RouteSuspense>
              </AdminOnly>
            }
          />
          <Route
            path='/admin'
            element={<Navigate to='/admin/dashboard' replace />}
          />
          <Route
            path='/admin/:section'
            element={
              <AdminOnly>
                <RouteSuspense>
                  <AdminPage />
                </RouteSuspense>
              </AdminOnly>
            }
          />
        </Route>
        <Route element={<AppShell />}>
          <Route
            path='/'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <HomePage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/products'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <ProductsPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/about'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <AboutPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/products/:slug'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <ProductDetailPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/cart'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <CartPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/checkout'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <CheckoutPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/profile'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <ProfilePage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/profile/notifications'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <ProfilePage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/orders/:id'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <OrderDetailPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/payment-return'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <PaymentReturnPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/login'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <LoginPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/register'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <RegisterPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/forgot-password'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <ForgotPasswordPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/reset-password'
            element={
              <CustomerOnly>
                <RouteSuspense>
                  <ResetPasswordPage />
                </RouteSuspense>
              </CustomerOnly>
            }
          />
          <Route
            path='/verify-otp'
            element={
              <RouteSuspense>
                <VerifyOtpPage />
              </RouteSuspense>
            }
          />
          <Route
            path='*'
            element={
              <RouteSuspense>
                <NotFoundPage />
              </RouteSuspense>
            }
          />
        </Route>
      </Routes>
    </>
  )
}
