import { ReloadOutlined } from '@ant-design/icons'
import type { UseQueryResult } from '@tanstack/react-query'
import { Button, Tooltip } from 'antd'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export type AdminRefreshQuery<TData = unknown, TError = Error> = Pick<
  UseQueryResult<TData, TError>,
  'refetch' | 'isFetching' | 'isPending'
>

type AdminQueryRefreshButtonProps<TData, TError> = {
  query: AdminRefreshQuery<TData, TError>
  label?: string
}

export function AdminRefreshButtonAction<TData, TError>({
  query,
  label
}: AdminQueryRefreshButtonProps<TData, TError>) {
  const { t } = useTranslation()
  const { refetch, isFetching, isPending } = query
  const isRefetching = isFetching && !isPending

  return (
    <Tooltip title={label ?? t('admin.tooltipRefresh')}>
      <Button
        icon={<ReloadOutlined />}
        loading={isRefetching}
        onClick={() => {
          void refetch().then((result) => {
            if (result.error) {
              toast.error(t('admin.refreshFailed'))
              return
            }
            toast.success(t('admin.refreshSuccess'))
          })
        }}
      />
    </Tooltip>
  )
}
