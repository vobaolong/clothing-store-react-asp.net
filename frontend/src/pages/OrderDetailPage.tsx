import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Form, Input, Modal, Select, Skeleton } from 'antd'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { getAuthToken } from '@/state/auth/auth-session'
import { createCancellationRequest, getMyOrderDetail } from '@/api/orders-api'
import { createReview } from '@/api/reviews-api'
import toast from 'react-hot-toast'
import { LeftOutlined } from '@ant-design/icons'
import { OrderStatus, CancellationRequestStatus } from '@/enums'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'
import OrderDetailInfoCard from '@/components/order/OrderDetailInfoCard'
import OrderDetailItemsTable from '@/components/order/OrderDetailItemsTable'
import {
	OrderDetailTimelineCard,
	OrderDetailTotalsCard
} from '@/components/order/OrderDetailTimelineCard'
import OrderDetailReviewModal from '@/components/order/OrderDetailReviewModal'
import { useTranslation } from 'react-i18next'

export default function OrderDetailPage() {
	const { id } = useParams()
	const token = getAuthToken()
	const queryClient = useQueryClient()
	const [reviewingItemId, setReviewingItemId] = useState<string | null>(null)
	const { t } = useTranslation()

	const detailQuery = useQuery({
		queryKey: QUERY_KEYS.myOrderDetail(id),
		queryFn: () => getMyOrderDetail(String(id)),
		enabled: Boolean(token && id)
	})

	useOrderRealtime(id)

	const detail = detailQuery.data
	const reviewingItem =
		detail?.items.find((item) => item.id === reviewingItemId) ?? null

	const createReviewMutation = useMutation({
		mutationFn: (values: {
			rating: number
			comment?: string
			tags?: string[]
		}) =>
			createReview({
				productId: reviewingItem?.productId ?? '',
				orderItemId: reviewingItem?.id,
				rating: values.rating,
				comment: values.comment,
				tags: values.tags
			}),
		onSuccess: async () => {
			toast.success('Đã gửi đánh giá')
			setReviewingItemId(null)
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.myOrderDetail(id)
				}),
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.productReviews(reviewingItem?.productId)
				})
			])
		},
		onError: () => {
			toast.error('Không thể gửi đánh giá')
		}
	})

	const canCancelOrder =
		detail?.status === OrderStatus.PENDING ||
		detail?.status === OrderStatus.CONFIRMED

	const existingRequest = detail?.cancellationRequest ?? null
	const pendingRequest = existingRequest?.status === CancellationRequestStatus.PENDING

	const [cancelModalOpen, setCancelModalOpen] = useState(false)
	const [cancelForm] = Form.useForm<{ reason: string; note?: string }>()

	const cancelOrderMutation = useMutation({
		mutationFn: async (values: { reason: string; note?: string }) => {
			if (!id) throw new Error('Missing order id')
			await createCancellationRequest(id, {
				reason: values.reason,
				note: values.note
			})
		},
		onSuccess: async () => {
			toast.success(t('order.cancelRequestSuccess'))
			setCancelModalOpen(false)
			cancelForm.resetFields()
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.myOrderDetail(id)
				}),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myOrders() })
			])
		},
		onError: (error: unknown) => {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
				t('order.cancelRequestFailed')
			toast.error(message)
		}
	})

	if (!token) return <Navigate to="/login" replace />
	if (detailQuery.isLoading) {
		return (
			<div className="space-y-4!">
				<Skeleton active paragraph={{ rows: 1 }} className="w-64!" />
				<Skeleton active className="h-40!" />
				<Skeleton active className="h-60!" />
				<div className="grid grid-cols-2 gap-4">
					<Skeleton active className="h-48!" />
					<Skeleton active className="h-48!" />
				</div>
			</div>
		)
	}
	if (!detail) return <p>Đơn hàng không tồn tại.</p>

	const subtotal = detail.items.reduce((sum, item) => sum + item.lineTotal, 0)
	const shippingFee = Math.max(
		detail.totalAmount - subtotal + detail.discountAmount,
		0
	)
	const histories = (detail.statusHistories ?? []).toSorted(
		(a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
	)

	return (
		<div className="space-y-4!">
			<div className="flex flex-wrap items-center gap-3">
				<Link
					to="/profile?tab=orders"
					className="hover:bg-slate-200! dark:hover:bg-slate-800! px-3 py-2.5 rounded-full"
				>
					<LeftOutlined />
				</Link>
				<h1 className="text-xl font-semibold sm:text-2xl m-0!">
					{t('order.orderDetails')}
				</h1>
				<div className="flex items-center gap-3">
					{canCancelOrder && !existingRequest ? (
						<Button
							danger
							loading={cancelOrderMutation.isPending}
							onClick={() => setCancelModalOpen(true)}
						>
							{t('order.cancelOrder')}
						</Button>
					) : null}
					{pendingRequest ? (
						<span className="text-amber-600 text-sm">
							{t('order.pendingCancellationRequest')}
						</span>
					) : null}
					{existingRequest?.status === CancellationRequestStatus.REJECTED ? (
						<span className="text-red-600 text-sm">
							{t('order.cancellationRequestRejected')}
						</span>
					) : null}
				</div>
			</div>

			<OrderDetailInfoCard detail={detail} />

			<OrderDetailItemsTable
				items={detail.items}
				onReview={setReviewingItemId}
			/>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<OrderDetailTimelineCard detail={detail} histories={histories} />
				<OrderDetailTotalsCard
					detail={detail}
					subtotal={subtotal}
					shippingFee={shippingFee}
				/>
			</div>

			<OrderDetailReviewModal
				item={reviewingItem}
				loading={createReviewMutation.isPending}
				onSubmit={async (values) => {
					await createReviewMutation.mutateAsync(values)
				}}
				onCancel={() => setReviewingItemId(null)}
			/>

			<Modal
				open={cancelModalOpen}
				title={t('order.cancelOrderTitle')}
				okText={t('order.submitRequest')}
				okButtonProps={{ danger: true, loading: cancelOrderMutation.isPending }}
				cancelText={t('common.close')}
				onOk={() => cancelForm.submit()}
				onCancel={() => {
					setCancelModalOpen(false)
					cancelForm.resetFields()
				}}
			>
				<Form
					form={cancelForm}
					layout="vertical"
					onFinish={(values) => cancelOrderMutation.mutateAsync(values)}
				>
					<Form.Item
						label={t('order.reason')}
						name="reason"
						rules={[{ required: true, message: t('order.reasonRequired') }]}
					>
						<Select
							placeholder={t('order.reasonPlaceholder')}
							options={[
								{ value: 'CHANGED_MIND', label: t('order.reasonChangedMind') },
								{ value: 'FOUND_CHEAPER', label: t('order.reasonCheaper') },
								{ value: 'LONG_DELIVERY', label: t('order.reasonLongDelivery') },
								{ value: 'OTHER', label: t('order.reasonOther') }
							]}
						/>
					</Form.Item>
					<Form.Item label={t('common.note')} name="note">
						<Input.TextArea
							rows={3}
							placeholder={t('order.reasonNotePlaceholder')}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}
