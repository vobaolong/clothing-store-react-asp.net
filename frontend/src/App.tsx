import { AppRouter } from '@/routes/app-router'
import { useSignalR } from '@/hooks/use-signalr'
import NotificationToastManager from '@/components/notification-toast'

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
