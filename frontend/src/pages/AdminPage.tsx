import { Navigate, useParams } from 'react-router-dom'
import AdminPageModals from '@/components/admin/admin-modal/AdminPageModals'
import AdminPageSections from '@/components/admin/admin-section/AdminPageSections'
import { AdminNavKey, isAdminNavKey } from '@/enums'
import { useSelector } from 'react-redux'
import { selectAuthUser } from '@/state/auth'
import { AdminProvider } from '@/context/admin/AdminProvider'

export default function AdminPage() {
  const { section } = useParams<{ section: string }>()
  const user = useSelector(selectAuthUser)
  const isAdminUser =
    user?.isAdmin === true ||
    (user as { role?: string })?.role === 'Admin' ||
    (user as Record<string, unknown>)?.[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ] === 'Admin'

  if (!isAdminUser) return <Navigate to="/" replace />
  if (!section || !isAdminNavKey(section)) {
    return <Navigate to={`/admin/${AdminNavKey.DASHBOARD}`} replace />
  }

  const activeNav = section

  return (
    <AdminProvider>
      <div className="min-h-0">
        <AdminPageSections activeNav={activeNav} />
        <AdminPageModals />
      </div>
    </AdminProvider>
  )
}
