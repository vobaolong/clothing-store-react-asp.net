import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { lazy } from 'react'
import { i18n } from '@/i18n'
import AdminShell from '@/layouts/AdminShell'
import AppShell from '@/layouts/AppShell'
import ScrollToTop from '@/components/ScrollToTop'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

const AboutPage = lazy(() => import('@/pages/AboutPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
const AdminOrderDetailPage = lazy(() => import('@/pages/AdminOrderDetailPage'))
const PaymentReturnPage = lazy(() => import('@/pages/PaymentReturnPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const VerifyOtpPage = lazy(() => import('@/pages/VerifyOtpPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function AdminDefaultRedirect() {
  const { lng } = useParams()

  return (
    <Navigate
      to={`/${lng ?? i18n.resolvedLanguage ?? 'vi'}/admin/dashboard`}
      replace
    />
  )
}

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AdminShell />}>
          <Route
            path="/:lng/admin/orders/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
              path="/:lng/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDefaultRedirect />
                </ProtectedRoute>
              }
            />
          <Route
            path="/:lng/admin/:section"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AppShell />}>
          <Route
            path="/:lng"
            element={
              <ProtectedRoute blockAdmin>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/products"
            element={
              <ProtectedRoute blockAdmin>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/about"
            element={
              <ProtectedRoute blockAdmin>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/products/:slug"
            element={
              <ProtectedRoute blockAdmin>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/cart"
            element={
              <ProtectedRoute blockAdmin>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/checkout"
            element={
              <ProtectedRoute blockAdmin>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/profile"
            element={
              <ProtectedRoute blockAdmin>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/orders/:id"
            element={
              <ProtectedRoute blockAdmin>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/payment-return"
            element={
              <ProtectedRoute blockAdmin>
                <PaymentReturnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/login"
            element={
              <ProtectedRoute blockAdmin>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/register"
            element={
              <ProtectedRoute blockAdmin>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/forgot-password"
            element={
              <ProtectedRoute blockAdmin>
                <ForgotPasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/reset-password"
            element={
              <ProtectedRoute blockAdmin>
                <ResetPasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/verify-otp"
            element={
              <ProtectedRoute>
                <VerifyOtpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:lng/*"
            element={
              <ProtectedRoute>
                <NotFoundPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/"
          element={
            <Navigate to={`/${i18n.resolvedLanguage ?? 'vi'}`} replace />
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={`/${i18n.resolvedLanguage ?? 'vi'}`} replace />
          }
        />
      </Routes>
    </>
  )
}
