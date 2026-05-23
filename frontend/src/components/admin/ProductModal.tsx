import { Modal, Spin } from 'antd'
import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import {
  DESCRIPTION_SPEC_LABELS,
  parseDescriptionSpecStoredValue,
  serializeDescriptionSpecValues
} from '@/constants/product'
import AdminProductFormFields from '@/components/admin/AdminProductFormFields'
import { createAdminProduct, updateAdminProduct } from '@/api/admin-api'
import { uploadAllVariantImages } from '@/utils/variant-image'
import { Form } from 'antd'
import type { AdminVariantsMatrixFieldHandle } from '@/components/admin/AdminVariantsMatrixField'

import type { DescriptionLayout, AdminCategory, AdminProduct } from '@/types'

const DEFAULT_DESCRIPTION_SPECS = DESCRIPTION_SPEC_LABELS.map((label) => ({
  label,
  value: [] as string[]
}))

const flattenVariantImageUrls = (
  variants: Array<{
    imageUrl?: string | null
    imageUrls?: string[] | null
  }>
): string[] => {
  const out: string[] = []
  for (const v of variants) {
    const raw =
      v.imageUrls?.flatMap((u) => {
        const value = String(u).trim()
        return value ? [value] : []
      }) ?? []
    const one = v.imageUrl?.trim()
    const row = raw.length > 0 ? [...new Set(raw)] : one ? [one] : []
    out.push(...row)
  }
  return [...new Set(out)]
}

type Props = {
  open: boolean
  editing: AdminProduct | null
  categories: AdminCategory[]
  onDirty: () => void
  onClose: () => void
  onSaved: () => void
}

export default function ProductModal({
  open,
  editing,
  categories,
  onDirty,
  onClose,
  onSaved
}: Props) {
  const [form] = Form.useForm()
  const variantsMatrixRef = useRef<AdminVariantsMatrixFieldHandle>(null)
  const [isUploading, setIsUploading] = useState(false)

  const parseDescriptionLayout = (raw: string): DescriptionLayout | null => {
    if (!raw?.trim()) return null
    try {
      return JSON.parse(raw) as DescriptionLayout
    } catch {
      return null
    }
  }

  const buildDefaultDescriptionSpecs = (
    specs: Array<{ label?: string; value?: string }> = []
  ) =>
    DEFAULT_DESCRIPTION_SPECS.map((defaultSpec) => {
      const matchedSpec = specs.find(
        (item) =>
          item.label?.trim().toLowerCase() === defaultSpec.label.toLowerCase()
      )
      return {
        label: defaultSpec.label,
        value: parseDescriptionSpecStoredValue(matchedSpec?.value ?? '')
      }
    })

  useEffect(() => {
    if (open) {
      form.resetFields()
      if (editing) {
        const parsed = parseDescriptionLayout(editing.descriptionData)
        form.setFieldsValue({
          measurementProfile: /quần/i.test(editing.categoryName)
            ? 'bottoms'
            : 'tops',
          name: editing.name,
          productCode: editing.productCode,
          description: editing.description,
          descriptionSpecs: buildDefaultDescriptionSpecs(parsed?.specs ?? []),
          categoryId: editing.categoryId,
          price: editing.price,
          salePrice: editing.salePrice,
          salePriceStartDate: editing.salePriceStartDate
            ? dayjs(editing.salePriceStartDate)
            : undefined,
          salePriceEndDate: editing.salePriceEndDate
            ? dayjs(editing.salePriceEndDate)
            : undefined,
          variants: (Array.isArray(editing.variants)
            ? editing.variants
            : []
          ).map((variant) => {
            const fromList =
              variant.imageUrls?.flatMap((u) => {
                const value = u.trim()
                return value ? [value] : []
              }) ?? []
            const one = variant.imageUrl?.trim()
            const gallery =
              fromList.length > 0 ? [...new Set(fromList)] : one ? [one] : []
            return {
              size: variant.size,
              color: variant.color,
              hex: variant.hex,
              quantity: variant.quantity,
              imageUrl: gallery[0] ?? null,
              imageUrls: gallery.length > 0 ? gallery : undefined
            }
          })
        })
      } else {
        form.setFieldsValue({
          measurementProfile: 'tops',
          descriptionSpecs: buildDefaultDescriptionSpecs(),
          description: '<p></p>'
        })
      }
    }
  }, [open, editing, form])

  const save = async () => {
    try {
      setIsUploading(true)
      const colorGalleryFiles =
        variantsMatrixRef.current?.getColorGalleryFiles()
      if (colorGalleryFiles) {
        const uploadedUrls = await uploadAllVariantImages(colorGalleryFiles)
        const variants = form.getFieldValue('variants') ?? []
        const updatedVariants = variants.map(
          (variant: {
            color?: string
            imageUrl?: string | null
            imageUrls?: string[] | null
          }) => {
            const color = variant.color?.trim()
            if (!color || !uploadedUrls[color]) return variant
            return {
              ...variant,
              imageUrl: uploadedUrls[color][0] ?? null,
              imageUrls:
                uploadedUrls[color].length > 0 ? uploadedUrls[color] : null
            }
          }
        )
        form.setFieldsValue({ variants: updatedVariants })
      }

      const values = await form.validateFields()
      const variants = values.variants
        .map(
          (variant: {
            size: string
            color: string
            hex: string
            quantity: number
            imageUrl?: string | null
            imageUrls?: string[] | null
          }) => {
            const raw =
              variant.imageUrls?.flatMap((u) => {
                const value = u.trim()
                return value ? [value] : []
              }) ?? []
            const urls =
              raw.length > 0
                ? [...new Set(raw)]
                : variant.imageUrl?.trim()
                  ? [variant.imageUrl.trim()]
                  : []
            return {
              size: variant.size.trim(),
              color: variant.color.trim(),
              hex: variant.hex.trim(),
              quantity: Number(variant.quantity),
              imageUrl: urls[0] ?? null,
              imageUrls: urls.length > 0 ? urls : null
            }
          }
        )
        .filter(
          (variant: {
            size: string
            color: string
            hex: string
            quantity: number
            imageUrl?: string | null
            imageUrls?: string[] | null
          }) =>
            variant.size &&
            variant.color &&
            /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(variant.hex) &&
            Number.isFinite(variant.quantity) &&
            variant.quantity >= 0
        )
      if (!variants.length) {
        toast.error('Vui lòng thêm ít nhất một biến thể hợp lệ')
        return
      }
      const imageUrls = flattenVariantImageUrls(variants)
      if (!imageUrls.length) {
        toast.error(
          'Vui lòng thêm ảnh trong mục Ảnh theo màu (ít nhất một màu).'
        )
        return
      }
      const descriptionData = JSON.stringify({
        specs: (values.descriptionSpecs ?? [])
          .map((item: { label?: string; value?: string | string[] }) => ({
            label: item.label?.trim(),
            value: Array.isArray(item.value)
              ? serializeDescriptionSpecValues(item.value)
              : item.value?.trim()
          }))
          .filter((item: { label?: string; value?: string }) => {
            if (!item.label || !item.value) return false
            return item.value.length > 0
          })
      })

      if (!Number.isFinite(values.price) || values.price <= 0) {
        toast.error('Giá gốc không hợp lệ')
        return
      }
      if (
        values.salePrice !== null &&
        values.salePrice !== undefined &&
        Number.isFinite(values.salePrice) &&
        values.salePrice >= values.price
      ) {
        toast.error('Giá sale phải nhỏ hơn giá gốc')
        return
      }
      const payload = {
        name: values.name,
        productCode: values.productCode,
        description: values.description,
        descriptionData,
        price: values.price,
        salePrice:
          values.salePrice !== undefined &&
          values.salePrice !== null &&
          Number.isFinite(values.salePrice)
            ? values.salePrice
            : null,
        salePriceStartDate: values.salePriceStartDate?.toISOString() ?? null,
        salePriceEndDate: values.salePriceEndDate?.toISOString() ?? null,
        categoryId: values.categoryId,
        variants
      }
      if (editing) await updateAdminProduct(editing.id, payload)
      else await createAdminProduct(payload)
      toast.success(
        editing ? 'Sản phẩm đã được cập nhật' : 'Sản phẩm đã được thêm'
      )
      setIsUploading(false)
      onSaved()
    } catch (error) {
      setIsUploading(false)
      const message =
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra trong quá trình thực hiện'
      toast.error(message)
    }
  }

  return (
    <Modal
      title={editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
      open={open}
      onOk={save}
      cancelText='Đóng'
      okText={editing ? 'Cập nhật' : 'Thêm'}
      onCancel={onClose}
      okButtonProps={{ disabled: isUploading, loading: isUploading }}
      width={1000}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      destroyOnHidden
    >
      <Spin spinning={isUploading} description='Đang xử lý...'>
        <AdminProductFormFields
          form={form}
          categories={categories}
          productModalOpen={open}
          editingProductId={editing?.id}
          onFormValuesChange={onDirty}
          variantsMatrixRef={variantsMatrixRef}
        />
      </Spin>
    </Modal>
  )
}
