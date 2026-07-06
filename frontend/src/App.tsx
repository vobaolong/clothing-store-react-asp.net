import { AppRouter } from '@/routes/app-router'
import { useSignalR } from '@/hooks/useSignalR'
import NotificationToastManager from '@/components/NotificationToast'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { syncLanguageFromPath } from '@/i18n'

function LanguageSync() {
  const location = useLocation()

  useEffect(() => {
    void syncLanguageFromPath(location.pathname)
  }, [location.pathname])

  return null
}

export default function App() {
  useSignalR()

  return (
    <>
      <LanguageSync />
      <AppRouter />
      <NotificationToastManager />
    </>
  )
}
