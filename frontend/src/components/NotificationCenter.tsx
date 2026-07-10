import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Badge, Popover, Spin, Empty, List, Typography, Button } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useNotifications, useUnreadCount } from '@/hooks/useNotifications'
import type { NotificationDto } from '@/types/notification.type'
import { getNotificationIcon } from '@/utils/notification'
import { selectNotificationUnreadCount } from '@/state/notification-slice'
import { isAdmin } from '@/state/auth/auth-session'
import { lp } from '@/utils/language-path'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'

const formatRelativeTime = (dateString: string): string => {
  const diffSec = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1_000
  )
  if (diffSec < 60) return i18n.t('notification.justNow')
  if (diffSec < 3_600)
    return i18n.t('notification.minutesAgo', { n: Math.floor(diffSec / 60) })
  if (diffSec < 86_400)
    return i18n.t('notification.hoursAgo', { n: Math.floor(diffSec / 3_600) })
  return i18n.t('notification.daysAgo', { n: Math.floor(diffSec / 86_400) })
}

export const NotificationCenter = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const { notifications, isLoading, markAsRead, markAllAsRead, refetch } =
    useNotifications({ page: 1, pageSize: 20 })

  useUnreadCount()
  const unreadCount = useSelector(selectNotificationUnreadCount)

  const handleToggle = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (open) refetch()
    },
    [refetch]
  )

  const openNotificationsPage = () => {
    setIsOpen(false)
    navigate(lp('/profile?tab=notifications'))
  }

  const openRelatedOrderDetail = (notification: NotificationDto) => {
    setIsOpen(false)
    if (!notification.relatedEntityId) {
      openNotificationsPage()
      return
    }
    if (isAdmin()) {
      navigate(lp(`/admin/orders/${notification.relatedEntityId}`))
    } else {
      navigate(lp(`/orders/${notification.relatedEntityId}`))
    }
  }

  const handleClickNotification = (notification: NotificationDto) => {
    if (!notification.isRead) markAsRead(notification.id)

    if (
      notification.relatedEntityType === 'Order' &&
      notification.relatedEntityId
    ) {
      openRelatedOrderDetail(notification)
    } else {
      openNotificationsPage()
    }
  }
  const { t } = useTranslation()

  const dropdown = (
    <div className="w-80 sm:w-96">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-md">
        <Typography.Text strong>
          {t('notification.announcements')}
        </Typography.Text>
        {unreadCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              markAllAsRead()
            }}
            className="text-sm font-medium cursor-pointer bg-transparent border-0"
          >
            {t('notification.markAsRead')}
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            className="py-8"
            description={t('notification.noNotifications')}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                key={notification.id}
                onClick={() => handleClickNotification(notification)}
                className={`cursor-pointer transition-colors px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${
                  !notification.isRead
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-black/10'
                }`}
              >
                <List.Item.Meta
                  avatar={
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                  }
                  title={
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-sm ${
                          !notification.isRead
                            ? 'font-semibold text-gray-900 dark:text-gray-300'
                            : 'font-medium text-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {notification.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-300 shrink-0">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  }
                  description={
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2.5 text-center border-t border-gray-200 rounded-b-md">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openNotificationsPage()
            }}
            className="text-sm font-medium cursor-pointer bg-transparent border-0 hover:text-slate-400!"
          >
            {t('notification.viewAll')}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <Popover
      content={dropdown}
      trigger="click"
      open={isOpen}
      onOpenChange={handleToggle}
      placement="bottomRight"
      arrow={false}
    >
      <Badge
        count={unreadCount}
        overflowCount={99}
        size="small"
        offset={[-4, 4]}
      >
        <Button
          type="text"
          icon={<BellOutlined />}
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        />
      </Badge>
    </Popover>
  )
}

export default NotificationCenter
