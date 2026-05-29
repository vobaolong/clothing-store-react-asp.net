import { AppRouter } from '@/routes/app-router'
import { useSignalR } from '@/hooks/useSignalR'
import NotificationToastManager from '@/components/NotificationToast'

export default function App() {
  // Initialize SignalR connection
  useSignalR()

  return (
    <>
      <AppRouter />
      <NotificationToastManager />
    </>
  )
}
