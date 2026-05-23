import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationType } from '@/types/notification'
import type { NotificationDto } from '@/types/notification'
import { Button, Spin } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { isAdmin } from '@/state/auth-session'

const formatRelativeTime = (dateString: string): string => {
  const diffSec = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1_000
  )
  if (diffSec < 60) return 'Vừa xong'
  if (diffSec < 3_600) return `${Math.floor(diffSec / 60)} phút trước`
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3_600)} giờ trước`
  return `${Math.floor(diffSec / 86_400)} ngày trước`
}

const getIcon = (type: NotificationDto['type']): string => {
  switch (type) {
    case NotificationType.OrderCreated:
      return '🛍️'
    case NotificationType.OrderConfirmed:
      return '✅'
    case NotificationType.OrderShipping:
      return '🚚'
    case NotificationType.OrderDelivered:
      return '📦'
    case NotificationType.OrderCancelled:
      return '❌'
    case NotificationType.PaymentReceived:
      return '💳'
    case NotificationType.Promotion:
      return '🎉'
    default:
      return '🔔'
  }
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onOpenNotifications,
  onNavigateToOrderDetail
}: {
  notification: NotificationDto
  onMarkAsRead: (id: string) => void
  onOpenNotifications: () => void
  onNavigateToOrderDetail: (notification: NotificationDto) => void
}) => {
  const handleClick = () => {
    if (!notification.isRead) onMarkAsRead(notification.id)

    if (
      notification.relatedEntityType === 'Order' &&
      notification.relatedEntityId
    ) {
      onNavigateToOrderDetail(notification)
      return
    }

    onOpenNotifications()
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={[
        'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      ].join(' ')}
    >
      <div className='flex items-start gap-3'>
        <span className='text-lg shrink-0'>{getIcon(notification.type)}</span>
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <h4
              className={`text-sm text-gray-900 ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}
            >
              {notification.title}
            </h4>
            <span className='text-xs text-gray-500 shrink-0'>
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className='mt-1 text-sm text-gray-600'>{notification.message}</p>
          {/* {notification.relatedEntityType === 'Order' &&
            notification.relatedEntityId && (
              <span className='inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                Đơn hàng{' '}
                {notification.relatedEntityId.slice(0, 8).toUpperCase()}
              </span>
            )} */}
        </div>
        {!notification.isRead && (
          <div className='w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5' />
        )}
      </div>
    </div>
  )
}

interface NotificationCenterProps {
  className?: string
}

export const NotificationCenter = ({
  className = ''
}: NotificationCenterProps) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch
  } = useNotifications({ page: 1, pageSize: 20 })

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (next) refetch()
  }

  const openNotificationsPage = () => {
    setIsOpen(false)
    navigate('/profile/notifications')
  }

  const openRelatedOrderDetail = (notification: NotificationDto) => {
    if (!notification.relatedEntityId) {
      openNotificationsPage()
      return
    }

    setIsOpen(false)
    if (isAdmin()) {
      navigate(`/admin/orders/${notification.relatedEntityId}`)
      return
    }

    navigate(`/orders/${notification.relatedEntityId}`)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={handleToggle}
        className='relative p-2 text-gray-600 rounded-lg hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
        aria-label='Thông báo'
        aria-expanded={isOpen}
        icon={<BellOutlined />}
      >
        {unreadCount > 0 && (
          <span className='absolute flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full -top-1 -right-1'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute right-0 z-50 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg w-80 sm:w-96'>
          {/* Header */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50'>
            <h3 className='text-base font-semibold text-gray-900'>Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className='text-sm font-medium text-blue-600 hover:text-blue-800'
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className='h-72! overflow-y-auto overscroll-contain'>
            {isLoading ? (
              <Spin description='Loading'>Đang tải</Spin>
            ) : notifications.length === 0 ? (
              <div className='p-8 text-center text-gray-400'>
                <p className='text-sm'>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkAsRead={markAsRead}
                  onOpenNotifications={openNotificationsPage}
                  onNavigateToOrderDetail={openRelatedOrderDetail}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='px-4 py-3 text-center border-t border-gray-200 bg-gray-50'>
              <button
                onClick={openNotificationsPage}
                className='text-sm font-medium text-blue-600 hover:text-blue-800'
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
