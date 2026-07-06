import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { notification as antdNotification } from 'antd'
import {
  clearRealtimeNotifications,
  selectRealtimeNotifications
} from '@/state/notification-slice'
import type { RealtimeNotificationDto } from '@/types/notification.type'
import { getNotificationIcon, getNotificationLevel } from '@/utils/notification'
import { isAdmin } from '@/state/auth/auth-session'
import { useTranslation } from 'react-i18next'

export const NotificationToastManager = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const queue = useSelector(selectRealtimeNotifications)

  useEffect(() => {
    if (isAdmin()) {
      if (queue.length > 0) {
        dispatch(clearRealtimeNotifications())
      }
      return
    }

    if (queue.length === 0) return

    const snapshot = [...queue]
    dispatch(clearRealtimeNotifications())

    snapshot.forEach((n: RealtimeNotificationDto) => {
      const icon = getNotificationIcon(n.type)
      const level = getNotificationLevel(n.type)

      antdNotification[level]({
        message: `${icon} ${n.title}`,
        description:
          n.relatedEntityType === 'Order' && n.relatedEntityId ? (
            <span>
              {n.message}{' '}
              <a
                href={`/orders/${n.relatedEntityId}`}
                className="font-medium underline"
              >
                {t('notification.viewOrder')}
              </a>
            </span>
          ) : (
            n.message
          ),
        placement: 'topRight',
        duration: 6
      })
    })
  }, [queue, dispatch])

  return null
}

export default NotificationToastManager
