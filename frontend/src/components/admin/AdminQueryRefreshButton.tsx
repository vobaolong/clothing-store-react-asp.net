import { ReloadOutlined } from '@ant-design/icons'
import type { UseQueryResult } from '@tanstack/react-query'
import { Button, Tooltip } from 'antd'
import toast from 'react-hot-toast'

export type AdminRefreshQuery<TData = unknown, TError = Error> = Pick<
  UseQueryResult<TData, TError>,
  'refetch' | 'isFetching' | 'isPending'
>

type AdminQueryRefreshButtonProps<TData, TError> = {
  query: AdminRefreshQuery<TData, TError>
  label?: string
}

export function AdminQueryRefreshButton<TData, TError>({
  query,
  label = 'Tải dữ liệu'
}: AdminQueryRefreshButtonProps<TData, TError>) {
  const { refetch, isFetching, isPending } = query
  const isRefetching = isFetching && !isPending

  return (
    <Tooltip title={label}>
      <Button
        icon={<ReloadOutlined />}
        loading={isRefetching}
        onClick={() => {
          void refetch().then((result) => {
            if (result.error) {
              toast.error('Tải dữ liệu thất bại')
              return
            }
            toast.success('Tải dữ liệu thành công')
          })
        }}
      />
    </Tooltip>
  )
}
