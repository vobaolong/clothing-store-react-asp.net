import { Checkbox, Form, Input, Modal, Select, TreeSelect, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { UploadFile } from 'antd'
import {
	createAdminCategory,
	getAdminCategories,
	updateAdminCategory
} from '@/api/admin-api'
import { uploadImage } from '@/api/uploads-api'
import type { AdminCategory } from '@/types'
import { CategoryGender, CategoryProductType } from '@/enums'
import {
	buildCategoryTreeSelectData,
	collectDescendantCategoryIds,
	type CategoryTreeNode
} from '@/utils/category-tree'
import { toCapitalize } from '@/utils/table.lib'

type Props = {
	open: boolean
	editing: AdminCategory | null
	onDirty: () => void
	onClose: () => void
	onSaved: () => void
}

const buildExistingCategoryImageFiles = (
	category: AdminCategory
): UploadFile[] =>
	category.image
		? [
			{
				uid: `existing-${category.id}`,
				name: 'image',
				status: 'done',
				url: category.image
			}
		]
		: []

function CategoryModal({ open, editing, onDirty, onClose, onSaved }: Props) {
	const [form] = Form.useForm()
	const [modalState, setModalState] = useState({
		imageFiles: [] as UploadFile[],
		parentTreeData: [] as CategoryTreeNode[],
		isLoadingParents: false
	})

	const save = useCallback(async () => {
		const values = await form.validateFields()
		const selected = modalState.imageFiles[0]
		let image = values.image?.trim() ?? ''

		if (selected?.originFileObj) {
			const uploaded = await uploadImage(selected.originFileObj, 'categories')
			image = uploaded.url
		} else if (!image && selected?.url) {
			image = String(selected.url)
		}

		if (!image) {
			toast.error('Please select a category image')
			return
		}

		const payload = {
			name: values.name,
			image,
			description: values.description?.trim() || undefined,
			parentId: values.parentId || null,
			level: values.parentId ? 1 : 0,
			gender: values.gender,
			productType: values.productType || undefined,
			isActive: Boolean(values.isActive)
		}
		if (editing) await updateAdminCategory(editing.id, payload)
		else await createAdminCategory(payload)

		toast.success(editing ? 'Category updated' : 'Category created')
		onSaved()
	}, [form, modalState.imageFiles, editing, onSaved])

	useEffect(() => {
		if (open) {
			form.resetFields()
			if (editing) {
				form.setFieldsValue({
					name: editing.name,
					image: editing.image,
					description: editing.description ?? '',
					parentId: editing.parentId ?? undefined,
					gender: editing.gender ?? CategoryGender.UNISEX,
					productType: editing.productType ?? CategoryProductType.CLOTHING,
					isActive: editing.isActive
				})
			} else {
				form.setFieldsValue({
					parentId: undefined,
					gender: CategoryGender.UNISEX,
					productType: CategoryProductType.CLOTHING,
					isActive: true
				})
			}
		}
	}, [open, editing, form])

	return (
		<Modal
			title={editing ? 'Edit Category' : 'Create Category'}
			open={open}
			onOk={save}
			onCancel={onClose}
			styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
			afterOpenChange={(nextOpen) => {
				if (!nextOpen) {
					setModalState({
						imageFiles: [],
						parentTreeData: [],
						isLoadingParents: false
					})
					return
				}
				setModalState((prev) => ({ ...prev, isLoadingParents: true }))
				void getAdminCategories()
					.then((categories) => {
						const exclude =
							editing?.id != null
								? collectDescendantCategoryIds(editing.id, categories)
								: new Set<string>()
						const eligible = categories.filter((c) => !exclude.has(c.id))
						setModalState((prev) => ({
							...prev,
							parentTreeData: buildCategoryTreeSelectData(eligible)
						}))
					})
					.finally(() => {
						setModalState((prev) => ({ ...prev, isLoadingParents: false }))
					})
				if (editing) {
					setModalState((prev) => ({
						...prev,
						imageFiles: buildExistingCategoryImageFiles(editing)
					}))
					return
				}
				setModalState((prev) => ({ ...prev, imageFiles: [] }))
			}}
		>
			<Form form={form} layout='vertical' onValuesChange={onDirty}>
				<Form.Item name='name' label='Name' rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item name='description' label='Description'>
					<Input.TextArea rows={3} />
				</Form.Item>
				<Form.Item name='parentId' label='Parent Category'>
					<TreeSelect
						className='w-full!'
						allowClear
						placeholder='Chọn danh mục cha'
						loading={modalState.isLoadingParents}
						showSearch={{ treeNodeFilterProp: 'title' }}
						treeDefaultExpandAll
						treeLine={{ showLeafIcon: false }}
						treeData={modalState.parentTreeData}
						styles={{ popup: { root: { maxHeight: 400 } } }}
					/>
				</Form.Item>
				<Form.Item name='gender' label='Gender' rules={[{ required: true }]}>
					<Select
						options={Object.values(CategoryGender).map((value) => ({
							label: toCapitalize(value),
							value
						}))}
					/>
				</Form.Item>
				<Form.Item name='productType' label='Product Type'>
					<Select
						allowClear
						options={Object.values(CategoryProductType).map((value) => ({
							label: toCapitalize(value),
							value
						}))}
					/>
				</Form.Item>

				<Form.Item label='Image' required>
					<div className='space-y-3'>
						<div>
							<Upload.Dragger
								accept='image/*'
								maxCount={1}
								beforeUpload={() => false}
								fileList={modalState.imageFiles}
								onChange={async (info) => {
									setModalState((prev) => ({ ...prev, imageFiles: info.fileList }))
									onDirty()
									const file = info.file
									if (file.originFileObj && !file.url) {
										try {
											const uploaded = await uploadImage(
												file.originFileObj,
												'categories'
											)
											setModalState((prev) => ({
												...prev,
												imageFiles: [
													{
														uid: file.uid,
														name: file.name,
														status: 'done',
														url: uploaded.url
													}
												]
											}))
											toast.success('Image uploaded')
										} catch (err) {
											toast.error((err as Error).message || 'Upload failed')
										}
									}
								}}
							>
								<p className='ant-upload-drag-icon'>
									<InboxOutlined />
								</p>
								<p className='ant-upload-text'>
									Click or drag image to this area to upload
								</p>
								<p className='ant-upload-hint'>
									Support for a single upload. You can also enter an image URL below.
								</p>
							</Upload.Dragger>
						</div>

						<div>
							<Form.Item
								name='image'
								label='Or enter image URL'
								style={{ marginBottom: 0 }}
							>
								<Input placeholder='https://example.com/image.jpg' allowClear />
							</Form.Item>
						</div>
					</div>
				</Form.Item>
				<Form.Item
					name='isActive'
					label='Is Active'
					valuePropName='checked'
					initialValue={true}
				>
					<Checkbox />
				</Form.Item>
			</Form>
		</Modal>
	)
}

// ====== Exports ======
export default CategoryModal
