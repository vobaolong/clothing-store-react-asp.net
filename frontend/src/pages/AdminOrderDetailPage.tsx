import { LeftOutlined, PrinterOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Empty, Image, Modal, Select, Skeleton, Tag } from 'antd'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getAdminOrderDetail, updateAdminOrderStatus } from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { formatCurrency, formatDate } from '@/utils/format'
import { getAuthToken, isAdmin } from '@/state/auth-session'
import {
  createOrderStatusOptions,
  getVietnameseStatusLabel
} from '@/utils/enum.utils'
import { canUpdateToStatus } from '@/utils/order-status-transition'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'
import { toCapitalize } from '@/utils/table.lib'
import { openBillPrintWindow } from '@/utils/bill-export'
import { OrderStatus } from '@/enums'

const formatStructuredAddress = (detail: {
  shippingStreet?: string
  shippingWard?: string
  shippingDistrict?: string
  shippingProvince?: string
  shippingAddress?: string
}) => {
  const structured = [
    detail.shippingStreet,
    detail.shippingWard,
    detail.shippingDistrict,
    detail.shippingProvince
  ]
    .filter((x) => Boolean(x && x.trim()))
    .join(', ')
  return structured || detail.shippingAddress || '-'
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const token = getAuthToken()
  const qc = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  )

  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.adminOrderDetail(id ?? undefined),
    queryFn: () => getAdminOrderDetail(String(id)),
    enabled: Boolean(id)
  })

  useOrderRealtime(id)

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      updateAdminOrderStatus(String(id), { status }),
    onSuccess: async () => {
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      await Promise.all([
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.adminOrderDetail(id ?? undefined)
        }),
        qc.invalidateQueries({ queryKey: QUERY_KEYS.adminOrdersBase })
      ])
    },
    onError: () => {
      toast.error('Cập nhật trạng thái đơn hàng thất bại')
    }
  })

  if (!token || !isAdmin()) return <Navigate to='/' replace />

  const detail = detailQuery.data
  const subtotal =
    detail?.items.reduce((sum, item) => sum + item.lineTotal, 0) ?? 0
  const shippingFee =
    detail != null
      ? Math.max(detail.totalAmount - subtotal + detail.discountAmount, 0)
      : 0
  const statusHistories = Array.isArray(detail?.statusHistories)
    ? detail!.statusHistories.toSorted(
        (a, b) =>
          new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
      )
    : []

  const handleExportBill = () => {
    if (!detail) return
    openBillPrintWindow(detail, () => {
      toast.error('Không thể mở cửa sổ in hóa đơn')
    })
  }

  return (
    <div className='space-y-4!'>
      <div className='flex flex-wrap gap-3 justify-between items-center'>
        <div className='flex gap-3 items-center min-w-0'>
          <Link
            to='/admin/orders'
            className='text-slate-600! hover:text-slate-500! hover:underline! hover:bg-slate-200! rounded-full p-2 '
          >
            <LeftOutlined />
          </Link>
          <div className='min-w-0'>
            <div className='text-2xl font-medium truncate'>
              Order: {detail ? detail.id.slice(0, 8).toUpperCase() : '...'}
            </div>
            {detail ? (
              <div className='text-xs text-slate-500'>
                Tạo lúc {formatDate(detail.createdAt)}
              </div>
            ) : null}
          </div>
        </div>

        <div className='flex flex-wrap gap-2 items-center'>
          {detail && (
            <Tag>{getVietnameseStatusLabel(detail.paymentStatus)}</Tag>
          )}
          <Select
            value={selectedStatus ?? detail?.status}
            onChange={(value) => setSelectedStatus(value)}
            disabled={
              detailQuery.isLoading ||
              !detail ||
              detail.status === OrderStatus.CANCELLED ||
              detail.status === OrderStatus.DELIVERED
            }
            options={createOrderStatusOptions().map((option) => ({
              ...option,
              label: getVietnameseStatusLabel(String(option.value)),
              disabled:
                detail == null ||
                !canUpdateToStatus(detail.status, String(option.value))
            }))}
            style={{ width: 150 }}
          />
          {detail &&
            detail.status !== OrderStatus.DELIVERED &&
            detail.status !== OrderStatus.CANCELLED && (
              <Button
                type='primary'
                disabled={detailQuery.isLoading || !detail || !id}
                loading={updateStatusMutation.isPending}
                onClick={() => {
                  if (!selectedStatus) {
                    toast.error('Vui lòng chọn trạng thái mới')
                    return
                  }
                  Modal.confirm({
                    title: 'Cập nhật trạng thái đơn hàng?',
                    onOk: async () =>
                      updateStatusMutation.mutateAsync({
                        status: selectedStatus
                      }),
                    okText: 'Cập nhật',
                    cancelText: 'Hủy'
                  })
                }}
              >
                Cập nhật
              </Button>
            )}
          <Button
            disabled={detailQuery.isLoading || !detail}
            onClick={handleExportBill}
            icon={<PrinterOutlined />}
          >
            Xuất hóa đơn
          </Button>
        </div>
      </div>
      {detailQuery.isLoading ? (
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <Card className='rounded-2xl lg:col-span-2' title='Sản phẩm'>
            <Skeleton active paragraph={{ rows: 7 }} />
          </Card>
          <Card className='rounded-2xl lg:col-span-1' title='Thông tin'>
            <Skeleton active paragraph={{ rows: 9 }} />
          </Card>
          <Card className='rounded-2xl lg:col-span-2' title='Tổng tiền'>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        </div>
      ) : !detail ? (
        <Card className='rounded-2xl'>
          <p className='m-0 text-slate-600'>Đơn hàng không tồn tại.</p>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <div className='space-y-4! lg:col-span-2'>
            <Card
              className='rounded-2xl'
              title={`Sản phẩm (${detail.items.length})`}
            >
              {detail.items.length === 0 ? (
                <Empty description='Đơn hàng chưa có sản phẩm' />
              ) : (
                <div className='divide-y divide-slate-100'>
                  {detail.items.map((row) => {
                    return (
                      <div
                        key={row.id}
                        className='flex gap-4 justify-between items-center py-3'
                      >
                        <div className='flex gap-3 items-center min-w-0'>
                          <Image
                            alt={row.productName}
                            src={row.imageUrl}
                            className='h-20! w-20! rounded-lg object-cover border border-slate-200'
                            loading='lazy'
                          />
                          <div className='min-w-0'>
                            <div className='font-medium truncate'>
                              {toCapitalize(row.productName)}
                            </div>
                            <div className='text-xs text-slate-500'>
                              {toCapitalize(row.variantColor)} /{' '}
                              {toCapitalize(row.variantSize)}
                            </div>
                          </div>
                        </div>

                        <div className='flex gap-8 items-center shrink-0'>
                          <div className='text-sm text-slate-600'>
                            SL:{' '}
                            <span className='font-medium text-slate-800'>
                              {row.quantity}
                            </span>
                          </div>
                          <div className='text-right'>
                            <div className='font-medium'>
                              {formatCurrency(row.lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className='rounded-2xl' title='Tóm tắt đơn hàng'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Thành tiền</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Giảm giá</span>
                  <span className='text-emerald-600'>
                    {detail.couponCodeSnapshot && (
                      <span className='inline-block py-1 px-2 mr-2 text-xs text-emerald-800 bg-emerald-100 rounded'>
                        {detail.couponCodeSnapshot}
                      </span>
                    )}
                    -{formatCurrency(detail.discountAmount || 0)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Phí vận chuyển</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div className='flex justify-between pt-2 mt-2 font-semibold border-t border-slate-200'>
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(detail.totalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className='space-y-4! lg:col-span-1'>
            <Card className='rounded-2xl' title='Địa chỉ giao hàng'>
              <div className='space-y-1 text-slate-700'>
                <div className='whitespace-nowrap'>
                  Họ tên: {detail.shippingName || '—'}
                </div>
                <div className='whitespace-nowrap'>
                  Điện thoại: {detail.shippingPhone || '—'}
                </div>
                <div className='whitespace-nowrap'>
                  Địa chỉ: {formatStructuredAddress(detail) || '—'}
                </div>
                <div className='whitespace-nowrap'>
                  Nhãn: {detail.shippingLabel || '—'}
                </div>
              </div>
            </Card>
            <Card className='rounded-2xl' title='Thông tin khách hàng'>
              <div className='space-y-1 text-slate-700'>
                <div className='whitespace-nowrap'>
                  Tên người dùng: {detail.userName || '—'}
                </div>
                <div className='whitespace-nowrap'>
                  Email: {detail.userEmail || '—'}
                </div>
              </div>
            </Card>
            {detail.note && (
              <Card className='rounded-2xl' title='Ghi chú'>
                <div className='text-slate-700'>{detail.note?.trim()}</div>
              </Card>
            )}
            <Card className='rounded-2xl' title='Lịch sử trạng thái'>
              {statusHistories.length === 0 ? (
                <p className='m-0 text-slate-600'>—</p>
              ) : (
                <div className='space-y-2'>
                  {statusHistories.map((h, idx) => (
                    <div key={`${h.changedAt}-${idx}`} className='text-sm'>
                      <span className='text-slate-500'>
                        {formatDate(h.changedAt)} -{' '}
                      </span>
                      <span className='font-medium'>
                        {getVietnameseStatusLabel(h.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
