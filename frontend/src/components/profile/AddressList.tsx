import { useState } from 'react'
import {
	Button,
	Card,
	Empty,
	Modal,
	Table,
	Tag,
	Form,
	Input,
	Checkbox,
	Tooltip,
} from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
	getShippingAddresses,
	createShippingAddress,
	deleteShippingAddress,
	setDefaultShippingAddress,
} from '@/api/addresses-api'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { ShippingAddress } from '@/types'
import toast from 'react-hot-toast'
import { DeleteOutlined } from '@ant-design/icons'

export default function AddressList() {
	const [open, setOpen] = useState(false)
	const [form] = Form.useForm()
	const queryClient = useQueryClient()
	const { data, isLoading } = useQuery({
		queryKey: QUERY_KEYS.shippingAddresses,
		queryFn: getShippingAddresses,
	})

	const refreshAddresses = async () => {
		await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shippingAddresses })
	}

	const createAddressMutation = useMutation({
		mutationFn: createShippingAddress,
		onSuccess: async () => {
			toast.success('Đã thêm địa chỉ mới')
			setOpen(false)
			form.resetFields()
			await refreshAddresses()
		},
	})

	const deleteAddressMutation = useMutation({
		mutationFn: deleteShippingAddress,
		onSuccess: async () => {
			toast.success('Đã xóa địa chỉ')
			await refreshAddresses()
		},
	})

	const setDefaultAddressMutation = useMutation({
		mutationFn: setDefaultShippingAddress,
		onSuccess: async () => {
			await refreshAddresses()
		},
	})

	return (
		<Card>
			<div className='flex items-center justify-between mb-3'>
				<h3 className='text-lg font-medium'>Sổ Địa Chỉ</h3>
				<Button type='primary' onClick={() => setOpen(true)}>
					Thêm địa chỉ mới
				</Button>
			</div>

			{(!data || data.length === 0) && !isLoading ? (
				<Empty description='Không có địa chỉ nào' />
			) : (
				<Table
					rowKey='id'
					loading={isLoading}
					dataSource={data ?? []}
					columns={[
						{ title: 'Họ và tên', dataIndex: 'fullName' },
						{ title: 'Số điện thoại', dataIndex: 'phone' },
						{
							title: 'Địa chỉ',
							render: (_value, row: ShippingAddress) => row.address || '-',
						},
						{
							title: 'Mặc định',
							dataIndex: 'isDefault',
							render: (val: boolean, row: ShippingAddress) =>
								val ? (
									<Tag color='green'>Mặc định</Tag>
								) : (
									<Button
										type='link'
										loading={setDefaultAddressMutation.isPending}
										onClick={async () => {
											await setDefaultAddressMutation.mutateAsync(row.id)
										}}
									>
										Thiết lập làm mặc định
									</Button>
								),
						},
						{
							title: 'Action',
							render: (_value, row: ShippingAddress) => (
								<Tooltip title='Xóa địa chỉ'>
									<Button
										danger
										loading={deleteAddressMutation.isPending}
										onClick={async () => {
											await deleteAddressMutation.mutateAsync(row.id)
										}}
										icon={<DeleteOutlined />}
									/>
								</Tooltip>
							),
						},
					]}
				/>
			)}

			<Modal
				title='Thêm địa chỉ mới'
				open={open}
				onCancel={() => setOpen(false)}
				onOk={async () => {
					const values = await form.validateFields()
					await createAddressMutation.mutateAsync(values)
				}}
				confirmLoading={createAddressMutation.isPending}
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='fullName'
						label='Họ và tên'
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item name='phone' label='Số điện thoại' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item
						name='address'
						label='Địa chỉ'
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item name='isDefault' valuePropName='checked'>
						<Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	)
}
