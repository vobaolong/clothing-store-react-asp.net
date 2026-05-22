import { useMemo, useState } from 'react'
import { Tag } from 'antd'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationType } from '@/types/notification'
import { formatDate } from '@/utils/format'
import type { NotificationDto } from '@/types/notification'
import { DownOutlined } from '@ant-design/icons'

const getNotificationIcon = (type: NotificationDto['type']) => {
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
    default:
      return '🔔'
  }
}

const getPrimaryImageUrl = (data: NotificationDto['data']) => {
  if (!data || typeof data !== 'object') return null
  const primaryImageUrl = (data as { primaryImageUrl?: unknown })
    .primaryImageUrl
  if (typeof primaryImageUrl !== 'string') return null
  const trimmed = primaryImageUrl.trim()
  return trimmed.length > 0 ? trimmed : null
}

export default function NotificationsSection() {
  const { notifications, markAsRead } = useNotifications({
    page: 1,
    pageSize: 100
  })
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  )

  const { groupedOrderNotifications, otherNotifications } = useMemo(() => {
    const orderNotifications = notifications.filter(
      (notification) =>
        notification.relatedEntityType === 'Order' &&
        notification.relatedEntityId
    )
    const nonOrderNotifications = notifications.filter(
      (notification) =>
        !(
          notification.relatedEntityType === 'Order' &&
          notification.relatedEntityId
        )
    )

    const groupedMap = new Map<string, NotificationDto[]>()
    orderNotifications.forEach((notification) => {
      const key = notification.relatedEntityId as string
      const existing = groupedMap.get(key) ?? []
      existing.push(notification)
      groupedMap.set(key, existing)
    })

    const grouped = Array.from(groupedMap.entries())
      .map(([orderId, items]) => {
        const sortedItems = [...items].sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
        )
        return {
          orderId,
          items: sortedItems,
          latest: sortedItems[0],
          unreadCount: sortedItems.filter((item) => !item.isRead).length
        }
      })
      .sort(
        (left, right) =>
          new Date(right.latest.createdAt).getTime() -
          new Date(left.latest.createdAt).getTime()
      )

    return {
      groupedOrderNotifications: grouped,
      otherNotifications: nonOrderNotifications
    }
  }, [notifications])

  const toggleGroup = (id: string) => {
    setExpandedGroups((s) => ({ ...s, [id]: !s[id] }))
  }

  return (
    <div>
      <h1 className='text-2xl font-semibold mb-4'>Thông báo</h1>

      {groupedOrderNotifications.length > 0 && (
        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-2'>Đơn hàng</h3>
          <div className='space-y-3 max-h-screen! overflow-y-auto'>
            {groupedOrderNotifications.map(
              ({ orderId, items, latest, unreadCount }) => {
                const isExpanded = expandedGroups[orderId] ?? false
                const thumbnailUrl = getPrimaryImageUrl(latest.data)
                return (
                  <div
                    key={orderId}
                    className='overflow-hidden rounded-lg border border-slate-200 bg-white'
                  >
                    <button
                      type='button'
                      className='w-full p-4 text-left hover:bg-slate-50 transition-colors'
                      onClick={() => toggleGroup(orderId)}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex min-w-0 flex-1 items-start gap-3'>
                          <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xl'>
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt='Sản phẩm'
                                className='h-full w-full rounded-md object-cover'
                              />
                            ) : (
                              getNotificationIcon(latest.type)
                            )}
                          </div>
                          <div className='min-w-0'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <div className='truncate font-semibold text-slate-900'>
                                {latest.title}
                              </div>
                              <Tag className='m-0'>{items.length} cập nhật</Tag>
                              {unreadCount > 0 && (
                                <Tag className='m-0' color='blue'>
                                  {unreadCount} chưa đọc
                                </Tag>
                              )}
                            </div>
                            <div className='mt-1 line-clamp-2 text-sm text-slate-600'>
                              {latest.message}
                            </div>
                            <div className='mt-2 text-xs text-slate-800'>
                              Mã đơn #{orderId.slice(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className='flex shrink-0 items-center gap-3'>
                          <div className='text-xs text-slate-400'>
                            {formatDate(latest.createdAt)}
                          </div>
                          <span
                            className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            aria-hidden
                          >
                            <DownOutlined />
                          </span>
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className='border-t border-slate-200 bg-slate-50 px-4 py-4'>
                        <div className='space-y-4'>
                          {items.map((item, index) => (
                            <button
                              key={item.id}
                              type='button'
                              onClick={() => {
                                if (!item.isRead) markAsRead(item.id)
                              }}
                              className='relative block w-full rounded-md bg-white px-4 py-3 text-left hover:bg-slate-100 transition-colors'
                            >
                              <div className='absolute left-0 top-0 flex h-full w-7 justify-center'>
                                <span
                                  className={`absolute left-3.25 top-2 h-2.5 w-2.5 rounded-full ${item.isRead ? 'bg-slate-300' : 'bg-blue-500'}`}
                                />
                                {index < items.length - 1 && (
                                  <span className='absolute left-4.25 top-5 -bottom-4.5 w-px bg-slate-300' />
                                )}
                              </div>
                              <div className='pl-6'>
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='font-medium text-slate-900'>
                                    {item.title}
                                  </div>
                                  <div className='shrink-0 text-xs text-slate-400'>
                                    {formatDate(item.createdAt)}
                                  </div>
                                </div>
                                <div className='mt-1 text-sm text-slate-600'>
                                  {item.message}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
            )}
          </div>
        </div>
      )}

      {otherNotifications.length > 0 && (
        <div>
          <h3 className='text-lg font-medium mb-2'>Khác</h3>
          <div className='space-y-3'>
            {otherNotifications.map((it) => (
              <button
                key={it.id}
                type='button'
                onClick={() => {
                  if (!it.isRead) markAsRead(it.id)
                }}
                className='w-full rounded-md border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <div className='font-medium text-slate-900'>{it.title}</div>
                    <div className='mt-1 text-sm text-slate-600'>
                      {it.message}
                    </div>
                  </div>
                  <div className='shrink-0 text-xs text-slate-400'>
                    {formatDate(it.createdAt)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className='p-6 text-center text-slate-500'>Không có thông báo</div>
      )}
    </div>
  )
}
