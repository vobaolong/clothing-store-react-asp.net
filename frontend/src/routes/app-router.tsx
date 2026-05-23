import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import AdminShell from '@/layouts/AdminShell'
import AppShell from '@/layouts/AppShell'
import ScrollToTop from '@/components/ScrollToTop'
import { getAuthToken, isAdmin } from '@/state/auth-session'

const AboutPage = lazy(() => import('@/pages/AboutPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(
  () => import('@/pages/CheckoutPage')
)
const ForgotPasswordPage = lazy(
  () => import('@/pages/ForgotPasswordPage')
)
const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const OrderDetailPage = lazy(
  () => import('@/pages/OrderDetailPage')
)
const AdminOrderDetailPage = lazy(
  () => import('@/pages/AdminOrderDetailPage')
)
const PaymentReturnPage = lazy(
  () => import('@/pages/PaymentReturnPage')
)
const ProductDetailPage = lazy(
  () => import('@/pages/ProductDetailPage')
)
const ProductsPage = lazy(
  () => import('@/pages/ProductsPage')
)
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ResetPasswordPage = lazy(
  () => import('@/pages/ResetPasswordPage')
)
const VerifyOtpPage = lazy(
  () => import('@/pages/VerifyOtpPage')
)
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
