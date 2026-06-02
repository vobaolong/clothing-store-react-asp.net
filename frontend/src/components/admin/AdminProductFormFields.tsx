import {
	DatePicker,
	Form,
	Input,
	InputNumber,
	Select,
	Switch,
	Table,
	TreeSelect
} from 'antd'
import type { FormInstance } from 'antd'
import type { NamePath } from 'antd/es/form/interface'
import { useEffect, useMemo, useState } from 'react'
import type { Ref } from 'react'
import { DESCRIPTION_SPEC_LABELS } from '@/constants/product'
import {
	MEASUREMENT_PRESET_OPTIONS,
	type MeasurementPresetRow,
	type MeasurementProfile,
	normalizeMeasurementGender,
	getMeasurementPresetLabel,
	getMeasurementPresetRows
} from '@/constants/measurement-presets'
import type { AdminCategory, ProductFormValues } from '@/types'
import {
	buildCategoryTreeSelectData,
	categoryPathLabel
} from '@/utils/category-tree'
import { formatCurrency } from '@/utils/format'
import AdminVariantsMatrixField, {
	type AdminVariantsMatrixFieldHandle
} from '@/components/admin/AdminVariantsMatrixField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import AdminDescriptionSpecField from '@/components/admin/AdminDescriptionSpecField'
import AdminProductPreviewCard from '@/components/admin/AdminProductPreviewCard'

type AdminProductFormFieldsProps = {
	form: FormInstance<ProductFormValues>
	categories: AdminCategory[]
	onFormValuesChange: () => void
	productModalOpen?: boolean
	editingProductId?: string
	variantsMatrixRef?: Ref<AdminVariantsMatrixFieldHandle>
}

function previewUrlFromVariants(
	variants: ProductFormValues['variants'] | undefined | null
): string | undefined {
	return variants
		?.map((v) => v.imageUrl || v.imageUrls?.[0])
		.find((url) => url?.trim())
		?.trim()
}

const BOTTOMS_CATEGORY_PATTERN = /quần|váy|đầm|dress/i

export default function AdminProductFormFields({
	form,
	categories,
	onFormValuesChange,
	productModalOpen,
	editingProductId,
	variantsMatrixRef
}: AdminProductFormFieldsProps) {
	const watchedValues = Form.useWatch([], form) as
		| Partial<ProductFormValues>
		| undefined
	const variantsWatch = Form.useWatch('variants', form) as
		| ProductFormValues['variants']
		| undefined
	const measurementProfile = Form.useWatch('measurementProfile', form) as
		| MeasurementProfile
		| undefined
	const sizeGuideGender = Form.useWatch('sizeGuideGender', form) as
		| 'male'
		| 'female'
		| 'unisex'
		| undefined
	const sizeGuideRows = Form.useWatch('sizeGuideRows', form) as
		| ProductFormValues['sizeGuideRows']
		| undefined
	const sizeGuidePresetProfile = Form.useWatch(
		'sizeGuidePresetProfile',
		form
	) as MeasurementProfile | undefined
	const [showSizeGuide, setShowSizeGuide] = useState(false)

	const descriptionSpecs = Form.useWatch('descriptionSpecs', form) as
		| Array<{ label: string; value?: string[] }>
		| undefined

	const [showSpecs, setShowSpecs] = useState(
		() => descriptionSpecs?.some((s) => s.value && s.value.length > 0) ?? false
	)

	const selectedCategory = useMemo(
		() => categories.find((c) => c.id === watchedValues?.categoryId),
		[categories, watchedValues?.categoryId]
	)

	const categoryName = selectedCategory?.name ?? ''
	const productType = selectedCategory?.productType?.toLowerCase() as
		| 'clothing'
		| 'shoes'
		| 'accessories'
		| undefined
	const resolvedProductType =
		productType === 'shoes'
			? 'shoes'
			: productType === 'accessories'
				? 'accessories'
				: productType === 'clothing' ||
					BOTTOMS_CATEGORY_PATTERN.test(categoryName)
					? 'clothing'
					: undefined

	const derivedMeasurementProfile = useMemo(() => {
		if (resolvedProductType === 'shoes') return 'shoes'
		if (resolvedProductType !== 'clothing') return undefined
		return BOTTOMS_CATEGORY_PATTERN.test(categoryName) ? 'bottoms' : 'tops'
	}, [categoryName, resolvedProductType])

	const derivedMeasurementGender = useMemo(
		() => normalizeMeasurementGender(selectedCategory?.gender),
		[selectedCategory?.gender]
	)

	const sizeGuideOptions = useMemo(() => {
		if (resolvedProductType === 'shoes') {
			return [{ label: 'Giày (size, độ dài chân)', value: 'shoes' as MeasurementProfile }]
		}
		if (resolvedProductType !== 'clothing') return []
		return MEASUREMENT_PRESET_OPTIONS
	}, [resolvedProductType]) as Array<{
		label: string
		value: MeasurementProfile
	}>

	const categoryTreeData = useMemo(
		() => buildCategoryTreeSelectData(categories),
		[categories]
	)

	const selectedCategoryName =
		categoryPathLabel(categories, watchedValues?.categoryId) ||
		'Chưa chọn danh mục'

	const previewImageUrl = useMemo(
		() => previewUrlFromVariants(variantsWatch),
		[variantsWatch]
	)

	useEffect(() => {
		if (!derivedMeasurementProfile) return

		if (
			measurementProfile !== derivedMeasurementProfile ||
			sizeGuidePresetProfile !== derivedMeasurementProfile ||
			sizeGuideGender !== derivedMeasurementGender
		) {
			form.setFieldsValue({
				measurementProfile: derivedMeasurementProfile,
				sizeGuidePresetProfile: derivedMeasurementProfile,
				sizeGuideGender: derivedMeasurementGender,
				sizeGuideRows: getMeasurementPresetRows(
					derivedMeasurementProfile,
					derivedMeasurementGender
				)
			})
		}
	}, [
		derivedMeasurementProfile,
		derivedMeasurementGender,
		form,
		measurementProfile,
		sizeGuideGender,
		sizeGuidePresetProfile
	])

	const sizeGuideColumns = useMemo(() => {
		const renderCell =
			(field: keyof MeasurementPresetRow) =>
				(_value: unknown, _record: MeasurementPresetRow, index: number) => (
					<Form.Item
						className="mb-0"
						name={['sizeGuideRows', index, field] as NamePath}
						rules={
							field === 'size'
								? [{ required: true, message: 'Vui lòng nhập size' }]
								: undefined
						}
					>
						<Input size="small" />
					</Form.Item>
				)

		if (measurementProfile === 'shoes') {
			return [
				{ title: 'Size', key: 'size', width: 120, render: renderCell('size') },
				{ title: 'Độ dài chân (cm)', key: 'footLength', render: renderCell('footLength') }
			]
		}

		if (measurementProfile === 'bottoms') {
			return [
				{ title: 'Size', key: 'size', width: 120, render: renderCell('size') },
				{
					title: 'Chiều cao (cm)',
					key: 'height',
					render: renderCell('height')
				},
				{ title: 'Cân nặng (kg)', key: 'weight', render: renderCell('weight') },
				{ title: 'Vòng eo (cm)', key: 'waist', render: renderCell('waist') }
			]
		}

		return [
			{ title: 'Size', key: 'size', width: 120, render: renderCell('size') },
			{ title: 'Chiều cao (cm)', key: 'height', render: renderCell('height') },
			{ title: 'Cân nặng (kg)', key: 'weight', render: renderCell('weight') },
			{ title: 'Vòng ngực (cm)', key: 'chest', render: renderCell('chest') }
		]
	}, [measurementProfile])

	const editableSizeGuideRows =
		Array.isArray(sizeGuideRows) && sizeGuideRows.length > 0
			? sizeGuideRows
			: measurementProfile
				? getMeasurementPresetRows(
					measurementProfile,
					sizeGuideGender ?? derivedMeasurementGender
				)
				: []

	const previewName = watchedValues?.name?.trim() || 'Tên sản phẩm'
	const previewBasePrice =
		typeof watchedValues?.price === 'number' ? watchedValues.price : undefined
	const previewSalePriceValue =
		typeof watchedValues?.salePrice === 'number'
			? watchedValues.salePrice
			: undefined
	const previewPrice =
		typeof previewBasePrice === 'number'
			? formatCurrency(previewBasePrice)
			: '—'
	const previewSalePriceFormatted =
		typeof previewSalePriceValue === 'number'
			? formatCurrency(previewSalePriceValue)
			: '—'
	const discountPercent =
		typeof previewBasePrice === 'number' &&
			typeof previewSalePriceValue === 'number' &&
			previewBasePrice > 0 &&
			previewSalePriceValue < previewBasePrice
			? Math.round(
				((previewBasePrice - previewSalePriceValue) / previewBasePrice) * 100
			)
			: 0
	const previewColors = useMemo(() => {
		const list: Array<{ color: string; hex: string }> = []
		const variants = watchedValues?.variants ?? []
		for (const v of variants) {
			const color = v?.color?.trim()
			const hex = v?.hex?.trim()
			if (color && hex && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
				const lowerColor = color.toLowerCase()
				const lowerHex = hex.toLowerCase()
				if (
					!list.some(
						(item) =>
							item.color.toLowerCase() === lowerColor &&
							item.hex.toLowerCase() === lowerHex
					)
				) {
					list.push({ color, hex })
				}
			}
		}
		return list
	}, [watchedValues?.variants])

	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
			<div className="relative z-30 min-w-0 isolate">
				<Form form={form} layout="vertical" onValuesChange={onFormValuesChange}>
					<Form.Item
						name="name"
						label="Tên sản phẩm"
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="categoryId"
						label="Danh mục"
						rules={[{ required: true }]}
					>
						<TreeSelect
							className="w-full!"
							placeholder="Chọn danh mục"
							allowClear
							showSearch={{ treeNodeFilterProp: 'title' }}
							treeDefaultExpandAll
							treeLine={{ showLeafIcon: false }}
							treeData={categoryTreeData}
							styles={{ popup: { root: { maxHeight: 400 } } }}
						/>
					</Form.Item>
					<Form.Item
						name="description"
						label="Mô tả"
						rules={[{ required: true }]}
					>
						<RichTextEditor />
					</Form.Item>
					<div className="mb-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-slate-900">
								Bảng thông số (Size Guide)
							</span>
							<Switch
								checked={showSizeGuide || !!measurementProfile}
								onChange={(checked) => {
									setShowSizeGuide(checked)
									if (!checked) {
										form.setFieldsValue({
											measurementProfile: undefined,
											sizeGuidePresetProfile: undefined,
											sizeGuideRows: []
										})
									}
								}}
								checkedChildren="Có"
								unCheckedChildren="Không"
							/>
						</div>
						{(showSizeGuide || !!measurementProfile) && (
							<>
								<Form.Item
									name="measurementProfile"
									label="Chọn loại thông số"
									rules={[
										{ required: true, message: 'Vui lòng chọn bảng thông số' }
									]}
								>
									<Select
										placeholder="Chọn loại thông số"
										options={sizeGuideOptions}
									/>
								</Form.Item>
								{measurementProfile ? (
									<div className="mt-2">
										<div className="mb-2 text-xs font-medium tracking-wider uppercase text-slate-500">
											{getMeasurementPresetLabel(
												measurementProfile,
												sizeGuideGender ?? derivedMeasurementGender
											)}
										</div>
										<Table<MeasurementPresetRow>
											size="small"
											bordered
											pagination={false}
											rowKey="size"
											dataSource={editableSizeGuideRows}
											columns={sizeGuideColumns}
											className="bg-white"
										/>
									</div>
								) : null}
							</>
						)}
					</div>

					<div className="mb-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-slate-900">
								Thông số
							</span>
							<Switch
								checked={showSpecs}
								onChange={(checked) => {
									setShowSpecs(checked)
									if (!checked) {
										if (descriptionSpecs) {
											form.setFieldsValue({
												descriptionSpecs: descriptionSpecs.map((s) => ({
													...s,
													value: []
												}))
											})
										} else {
											form.setFieldsValue({
												descriptionSpecs: DESCRIPTION_SPEC_LABELS.map(
													(label) => ({
														label,
														value: []
													})
												)
											})
										}
									} else if (
										!descriptionSpecs ||
										descriptionSpecs.length === 0
									) {
										form.setFieldsValue({
											descriptionSpecs: DESCRIPTION_SPEC_LABELS.map(
												(label) => ({
													label,
													value: []
												})
											)
										})
									}
								}}
								checkedChildren="Có"
								unCheckedChildren="Không"
							/>
						</div>
						{showSpecs && (
							<div className="p-4 space-y-2 border rounded-xl border-slate-200 bg-slate-50/30">
								{DESCRIPTION_SPEC_LABELS.map((label, index) => (
									<div key={label} className="flex items-start gap-2">
										<Form.Item
											className="hidden mb-0"
											name={['descriptionSpecs', index, 'label']}
											initialValue={label}
										>
											<Input />
										</Form.Item>
										<div className="flex items-center h-8 px-3 text-sm font-medium border rounded-lg w-36 border-slate-200 bg-slate-50 text-slate-700">
											{label}
										</div>
										<AdminDescriptionSpecField
											form={form}
											label={label}
											index={index}
										/>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="mb-4">
						<div className="mb-2 text-sm font-medium text-slate-900">
							Phân loại<span className="text-red-500"> *</span>
						</div>
						<AdminVariantsMatrixField
							ref={variantsMatrixRef}
							form={form}
							productType={resolvedProductType}
							modalOpen={productModalOpen}
							editingProductId={editingProductId}
						/>
					</div>
					<Form.Item
						name="variants"
						hidden
						rules={[
							{
								validator: async (_, value) => {
									if (!value || value.length === 0) {
										return Promise.reject(
											new Error('Please add at least one variant')
										)
									}
									const isAccessories = resolvedProductType === 'accessories'
									const hasInvalid = value.some(
										(variant: {
											size?: string
											color?: string
											hex?: string
										}) =>
											(!isAccessories && !variant?.size?.trim()) ||
											!variant?.color?.trim() ||
											!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(
												variant?.hex?.trim() ?? ''
											)
									)
									if (hasInvalid) {
										return Promise.reject(new Error('Variants are invalid'))
									}
								}
							}
						]}
					>
						<Input />
					</Form.Item>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Form.Item
							name="price"
							label="Giá gốc (VND)"
							rules={[{ required: true }]}
						>
							<InputNumber min={0} className="w-full!" />
						</Form.Item>
						<Form.Item
							name="salePrice"
							label="Giá sale (VND) — Tùy chọn"
							dependencies={['price']}
							rules={[
								({ getFieldValue }) => ({
									validator(_, value: number | null | undefined) {
										const price = getFieldValue('price') as number | undefined
										if (
											value === null ||
											value === undefined ||
											!Number.isFinite(value)
										) {
											return Promise.resolve()
										}
										if (typeof price !== 'number' || !Number.isFinite(price)) {
											return Promise.resolve()
										}
										if (value < price) {
											return Promise.resolve()
										}
										return Promise.reject(
											new Error('Giá sale phải nhỏ hơn giá gốc')
										)
									}
								})
							]}
						>
							<InputNumber min={0} className="w-full!" />
						</Form.Item>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Form.Item
							name="salePriceStartDate"
							label="Ngày bắt đầu giảm giá (Tùy chọn)"
							dependencies={['salePriceEndDate']}
							rules={[
								({ getFieldValue }) => ({
									validator(_, value) {
										const endDate = getFieldValue('salePriceEndDate')
										if (!value && !endDate) {
											return Promise.resolve()
										}
										if (value && endDate && value.isAfter(endDate)) {
											return Promise.reject(
												new Error('Ngày bắt đầu phải trước ngày kết thúc')
											)
										}
										return Promise.resolve()
									}
								})
							]}
						>
							<DatePicker
								className="w-full!"
								showTime
								format={'DD/MM/YYYY HH:mm:ss'}
							/>
						</Form.Item>
						<Form.Item
							name="salePriceEndDate"
							label="Ngày kết thúc giảm giá (Tùy chọn)"
							dependencies={['salePriceStartDate']}
							rules={[
								({ getFieldValue }) => ({
									validator(_, value) {
										const startDate = getFieldValue('salePriceStartDate')
										if (!value && !startDate) {
											return Promise.resolve()
										}
										if (value && startDate && value.isBefore(startDate)) {
											return Promise.reject(
												new Error('Ngày kết thúc phải sau ngày bắt đầu')
											)
										}
										return Promise.resolve()
									}
								})
							]}
						>
							<DatePicker
								className="w-full!"
								showTime
								format={'DD/MM/YYYY HH:mm:ss'}
							/>
						</Form.Item>
					</div>
					<Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
						<Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
					</Form.Item>
				</Form>
			</div>

			<AdminProductPreviewCard
				discountPercent={discountPercent}
				previewImageUrl={previewImageUrl}
				previewName={previewName}
				selectedCategoryName={selectedCategoryName}
				previewColors={previewColors}
				previewSalePriceFormatted={previewSalePriceFormatted}
				previewPrice={previewPrice}
			/>
		</div>
	)
}
