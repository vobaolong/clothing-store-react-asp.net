import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy } from 'react'
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

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AdminShell />}>
          <Route
            path="/admin/orders/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/:section"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <ProtectedRoute blockAdmin>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute blockAdmin>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute blockAdmin>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:slug"
            element={
              <ProtectedRoute blockAdmin>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute blockAdmin>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute blockAdmin>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute blockAdmin>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute blockAdmin>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-return"
            element={
              <ProtectedRoute blockAdmin>
                <PaymentReturnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute blockAdmin>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute blockAdmin>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ProtectedRoute blockAdmin>
                <ForgotPasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute blockAdmin>
                <ResetPasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <ProtectedRoute>
                <VerifyOtpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <NotFoundPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  )
}
