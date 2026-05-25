import { useMemo, useState } from 'react'
import { Card, Tag } from 'antd'
import { useNotifications } from '@/hooks/useNotifications'
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
    <Card>
      <h1 className='mb-4 text-2xl font-semibold'>Thông báo</h1>
      {groupedOrderNotifications.length > 0 && (
        <div className='pt-6 mb-6 border-t border-slate-200'>
          <div className='space-y-3 max-h-screen! overflow-y-auto'>
            {groupedOrderNotifications.map(
              ({ orderId, items, latest, unreadCount }) => {
                const isExpanded = expandedGroups[orderId] ?? false
                const thumbnailUrl = getPrimaryImageUrl(latest.data)
                return (
                  <div
                    key={orderId}
                    className='overflow-hidden bg-white border rounded-lg border-slate-200'
                  >
                    <button
                      type='button'
                      className='w-full p-4 text-left transition-colors cursor-pointer hover:bg-slate-50'
                      onClick={() => toggleGroup(orderId)}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-start flex-1 min-w-0 gap-3'>
                          <div className='flex items-center justify-center text-xl rounded-md h-14 w-14 shrink-0 bg-slate-100'>
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt='Sản phẩm'
                                className='object-cover w-full h-full rounded-md'
                              />
                            ) : (
                              getNotificationIcon(latest.type)
                            )}
                          </div>
                          <div className='min-w-0'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <div className='font-semibold truncate text-slate-900'>
                                {latest.title}
                              </div>
                              <Tag className='m-0'>{items.length} cập nhật</Tag>
                              {unreadCount > 0 && (
                                <Tag className='m-0' color='blue'>
                                  {unreadCount} chưa đọc
                                </Tag>
                              )}
                            </div>
                            <div className='mt-1 text-sm line-clamp-2 text-slate-600'>
                              {latest.message}
                            </div>
                            <div className='mt-2 text-xs text-slate-800'>
                              Mã đơn #{orderId.slice(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-3 shrink-0'>
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
                      <div className='px-4 py-4 border-t border-slate-200 bg-slate-50'>
                        <div className='space-y-4'>
                          {items.map((item, index) => (
                            <button
                              key={item.id}
                              type='button'
                              onClick={() => {
                                if (!item.isRead) markAsRead(item.id)
                              }}
                              className='relative block w-full px-4 py-3 text-left transition-colors bg-white rounded-md cursor-pointer hover:bg-slate-100'
                            >
                              <div className='absolute top-0 left-0 flex justify-center h-full w-7'>
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
                                  <div className='text-xs shrink-0 text-slate-400'>
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
          <h3 className='mb-2 text-lg font-medium'>Khác</h3>
          <div className='space-y-3'>
            {otherNotifications.map((it) => (
              <button
                key={it.id}
                type='button'
                onClick={() => {
                  if (!it.isRead) markAsRead(it.id)
                }}
                className='w-full p-4 text-left transition-colors bg-white border rounded-md border-slate-200 hover:bg-slate-50'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <div className='font-medium text-slate-900'>{it.title}</div>
                    <div className='mt-1 text-sm text-slate-600'>
                      {it.message}
                    </div>
                  </div>
                  <div className='text-xs shrink-0 text-slate-400'>
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
    </Card>
  )
}
