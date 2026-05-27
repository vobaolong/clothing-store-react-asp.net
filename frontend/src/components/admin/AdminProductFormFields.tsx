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
import { useMemo } from 'react'
import type { Ref } from 'react'
import { DESCRIPTION_SPEC_LABELS } from '@/constants/product'
import {
  MEASUREMENT_PRESET_OPTIONS,
  MEASUREMENT_PRESETS,
  type MeasurementProfile
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
  const descriptionSpecs = Form.useWatch('descriptionSpecs', form) as
    | Array<{ label: string; value?: string[] }>
    | undefined

  const hasSpecs =
    descriptionSpecs?.some((spec) => spec.value && spec.value.length > 0) ??
    false

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
    <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'>
      <div className='relative z-30 min-w-0 isolate'>
        <Form form={form} layout='vertical' onValuesChange={onFormValuesChange}>
          <Form.Item
            name='name'
            label='Tên sản phẩm'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='categoryId'
            label='Danh mục'
            rules={[{ required: true }]}
          >
            <TreeSelect
              className='w-full!'
              placeholder='Chọn danh mục'
              allowClear
              showSearch={{ treeNodeFilterProp: 'title' }}
              treeDefaultExpandAll
              treeLine={{ showLeafIcon: false }}
              treeData={categoryTreeData}
              styles={{ popup: { root: { maxHeight: 400 } } }}
            />
          </Form.Item>
          <Form.Item
            name='description'
            label='Mô tả'
            rules={[{ required: true }]}
          >
            <RichTextEditor />
          </Form.Item>
          <Form.Item
            name='measurementProfile'
            label='Bảng thông số'
            rules={[{ required: true, message: 'Vui lòng chọn bảng thông số' }]}
          >
            <Select
              placeholder='Chọn loại thông số'
              options={MEASUREMENT_PRESET_OPTIONS}
            />
          </Form.Item>
          {measurementProfile ? (
            <div className='mb-4'>
              {measurementProfile === 'tops' ? (
                <>
                  <div className='mb-2 text-sm font-medium text-slate-900'>
                    {MEASUREMENT_PRESETS.tops.label}
                  </div>
                  <Table
                    size='small'
                    bordered
                    pagination={false}
                    rowKey='size'
                    dataSource={MEASUREMENT_PRESETS.tops.data}
                    columns={MEASUREMENT_PRESETS.tops.columns}
                  />
                </>
              ) : (
                <>
                  <div className='mb-2 text-sm font-medium text-slate-900'>
                    {MEASUREMENT_PRESETS.bottoms.label}
                  </div>
                  <Table
                    size='small'
                    bordered
                    pagination={false}
                    rowKey='size'
                    dataSource={MEASUREMENT_PRESETS.bottoms.data}
                    columns={MEASUREMENT_PRESETS.bottoms.columns}
                  />
                </>
              )}
            </div>
          ) : null}

          <div className='mb-4'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-slate-900'>
                Thông số
              </span>
              <Switch
                checked={hasSpecs}
                onChange={(checked) => {
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
                checkedChildren='Có'
                unCheckedChildren='Không'
              />
            </div>
            {hasSpecs && (
              <div className='p-4 border space-y-2 rounded-xl border-slate-200 bg-slate-50/30'>
                {DESCRIPTION_SPEC_LABELS.map((label, index) => (
                  <div key={label} className='flex gap-2 items-start'>
                    <Form.Item
                      className='hidden mb-0'
                      name={['descriptionSpecs', index, 'label']}
                      initialValue={label}
                    >
                      <Input />
                    </Form.Item>
                    <div className='flex items-center px-3 w-36 h-8 text-sm font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700'>
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

          <div className='mb-4'>
            <div className='mb-2 text-sm font-medium text-slate-900'>
              Biến thể<span className='text-red-500'> *</span>
            </div>
            <AdminVariantsMatrixField
              ref={variantsMatrixRef}
              form={form}
              modalOpen={productModalOpen}
              editingProductId={editingProductId}
            />
          </div>
          <Form.Item
            name='variants'
            hidden
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    return Promise.reject(
                      new Error('Please add at least one variant')
                    )
                  }
                  const hasInvalid = value.some(
                    (variant: {
                      size?: string
                      color?: string
                      hex?: string
                    }) =>
                      !variant?.size?.trim() ||
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

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Form.Item
              name='price'
              label='Giá gốc (VND)'
              rules={[{ required: true }]}
            >
              <InputNumber min={0} className='w-full!' />
            </Form.Item>
            <Form.Item
              name='salePrice'
              label='Giá sale (VND) — Tùy chọn'
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
              <InputNumber min={0} className='w-full!' />
            </Form.Item>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Form.Item
              name='salePriceStartDate'
              label='Ngày bắt đầu giảm giá (Tùy chọn)'
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
                className='w-full!'
                showTime
                format={'DD/MM/YYYY HH:mm:ss'}
              />
            </Form.Item>
            <Form.Item
              name='salePriceEndDate'
              label='Ngày kết thúc giảm giá (Tùy chọn)'
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
                className='w-full!'
                showTime
                format={'DD/MM/YYYY HH:mm:ss'}
              />
            </Form.Item>
          </div>
          <Form.Item name='isActive' label='Trạng thái' valuePropName='checked'>
            <Switch checkedChildren='Hiển thị' unCheckedChildren='Ẩn' />
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
