import { Suspense, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getAuthToken, isAdmin } from '@/state/auth/auth-session'
import { lp } from '@/utils/language-path'

function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  blockAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  blockAdmin = false
}: ProtectedRouteProps) {
  const token = getAuthToken()

  if (requireAdmin) {
    if (!token) return <Navigate to={lp('/login')} replace />
    if (!isAdmin()) return <Navigate to={lp('/')} replace />
  }

  if (blockAdmin && isAdmin()) {
    return <Navigate to={lp('/admin')} replace />
  }

  return <RouteSuspense>{children}</RouteSuspense>
}
