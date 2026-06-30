import * as signalR from '@microsoft/signalr'
import { getAuthToken } from '@/state/auth/auth-session'
import type { RealtimeNotificationDto } from '@/types/notification.type'

const debug: (...args: unknown[]) => void = import.meta.env.DEV
  ? (...args: unknown[]) => console.log('[SignalR]', ...args)
  : () => {}

const debugError: (...args: unknown[]) => void = import.meta.env.DEV
  ? (...args: unknown[]) => console.error('[SignalR]', ...args)
  : () => {}

export class SignalRService {
  private connection: signalR.HubConnection | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 1_000
  private readonly maxReconnectDelay = 30_000
  private isManuallyDisconnected = false
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    this.isManuallyDisconnected = false

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/notifications`, {
        accessTokenFactory: () => getAuthToken() ?? token
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
            return null
          }
          const delay = Math.min(
            this.reconnectDelay * Math.pow(2, retryContext.previousRetryCount),
            this.maxReconnectDelay
          )
          const jitter = delay * 0.25 * (Math.random() - 0.5)
          return Math.max(1_000, delay + jitter)
        }
      })
      .configureLogging(
        import.meta.env.DEV ? signalR.LogLevel.Debug : signalR.LogLevel.Warning
      )
      .build()

    this.setupEventHandlers()

    try {
      await this.connection.start()
      this.reconnectAttempts = 0
      debug('Connected')
    } catch (error) {
      debugError('Connection error:', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      this.isManuallyDisconnected = true
      await this.connection.stop()
      this.connection = null
      debug('Disconnected')
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return

    this.connection.onclose((error) => {
      debug('Connection closed:', error)
      if (!this.isManuallyDisconnected) {
        void this.handleReconnection()
      }
    })

    this.connection.onreconnecting((error) => {
      debug('Reconnecting:', error)
    })

    this.connection.onreconnected((connectionId) => {
      debug('Reconnected:', connectionId)
      this.reconnectAttempts = 0
    })
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      debugError('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    )

    debug(
      `[SignalR] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    )

    await new Promise<void>((resolve) => setTimeout(resolve, delay))

    try {
      await this.start()
    } catch {
      await this.handleReconnection()
    }
  }

  onNotification(
    callback: (notification: RealtimeNotificationDto) => void
  ): void {
    this.connection?.on('ReceiveNotification', callback)
  }

  onOrderUpdate(callback: (orderUpdate: unknown) => void): void {
    this.connection?.on('ReceiveOrderUpdate', callback)
  }

  onSystemMessage(callback: (message: string) => void): void {
    this.connection?.on('ReceiveSystemMessage', callback)
  }

  offNotification(
    callback: (notification: RealtimeNotificationDto) => void
  ): void {
    this.connection?.off('ReceiveNotification', callback)
  }

  offOrderUpdate(callback: (orderUpdate: unknown) => void): void {
    this.connection?.off('ReceiveOrderUpdate', callback)
  }

  async joinGroup(groupName: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinGroup', groupName)
    }
  }

  async leaveGroup(groupName: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveGroup', groupName)
    }
  }

  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }
}

let _instance: SignalRService | null = null

export const getSignalRService = (): SignalRService => {
  if (!_instance) {
    const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5230/api').replace(/\/api$/, '')
    _instance = new SignalRService(baseUrl)
  }
  return _instance
}

export const disconnectSignalR = async (): Promise<void> => {
  if (_instance) {
    await _instance.stop()
    _instance = null
  }
}
