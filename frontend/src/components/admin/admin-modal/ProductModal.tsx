import { Modal, Spin, Form } from 'antd'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminProductFormFields from '@/components/admin/AdminProductFormFields'
import { createAdminProduct, updateAdminProduct } from '@/api/admin-api'
import { uploadAllVariantImages } from '@/utils/variant-image'
import type { AdminVariantsMatrixFieldHandle } from '@/components/admin/AdminVariantsMatrixField'
import type {
  AdminCategory,
  AdminProduct,
  AdminProductVariantPayload
} from '@/types'
import {
  flattenVariantImageUrls,
  buildDefaultDescriptionSpecs,
  transformProductToFormValues,
  prepareDescriptionData
} from '@/utils/product-form.utils'
import { getMeasurementPresetRows } from '@/constants/measurement-presets.constant'
import {
  DEFAULT_MEASUREMENT_PROFILE,
  DEFAULT_MEASUREMENT_GENDER
} from '@/constants/product-defaults.constant'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const variantsMatrixRef = useRef<AdminVariantsMatrixFieldHandle>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!open) return

    form.resetFields()
    if (editing) {
      form.setFieldsValue(transformProductToFormValues(editing))
    } else {
      form.setFieldsValue({
        measurementProfile: DEFAULT_MEASUREMENT_PROFILE,
        sizeGuideGender: DEFAULT_MEASUREMENT_GENDER,
        sizeGuidePresetProfile: DEFAULT_MEASUREMENT_PROFILE,
        sizeGuideRows: getMeasurementPresetRows(
          DEFAULT_MEASUREMENT_PROFILE,
          DEFAULT_MEASUREMENT_GENDER
        ),
        isActive: true,
        descriptionSpecs: buildDefaultDescriptionSpecs(),
        description: '<p></p>'
      })
    }
  }, [open, editing, form])

  const save = async () => {
    try {
      setIsUploading(true)
      const colorGalleryFiles =
        variantsMatrixRef.current?.getColorGalleryFiles()

      if (colorGalleryFiles) {
        const uploadedUrls = await uploadAllVariantImages(colorGalleryFiles)
        const currentVariants = form.getFieldValue('variants') ?? []

        const updatedVariants = currentVariants.map(
          (variant: AdminProductVariantPayload) => {
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

      const variants = (values.variants ?? [])
        .map((variant: AdminProductVariantPayload) => {
          const raw =
            variant.imageUrls?.flatMap((u: string) => {
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
        })
        .filter(
          (variant: AdminProductVariantPayload) =>
            variant.size != null &&
            variant.color &&
            /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(variant.hex) &&
            Number.isFinite(variant.quantity) &&
            variant.quantity >= 0
        )

      if (!variants.length) {
        toast.error(t('message.error.chosenVariant'))
        return
      }

      const imageUrls = flattenVariantImageUrls(variants)
      if (!imageUrls.length) {
        toast.error(t('message.error.chosenVariantImage'))
        return
      }

      if (!Number.isFinite(values.price) || values.price <= 0) {
        toast.error(t('message.error.invalidProductPrice'))
        return
      }

      if (
        values.salePrice !== null &&
        values.salePrice !== undefined &&
        Number.isFinite(values.salePrice) &&
        values.salePrice >= values.price
      ) {
        toast.error(t('message.error.salePriceMustBeLessThanOriginalPrice'))
        return
      }

      const payload = {
        name: values.name,
        description: values.description,
        descriptionData: prepareDescriptionData(values.descriptionSpecs, {
          profile: values.sizeGuidePresetProfile ?? values.measurementProfile,
          gender: values.sizeGuideGender,
          rows: values.sizeGuideRows
        }),
        price: values.price,
        salePrice: Number.isFinite(values.salePrice) ? values.salePrice : null,
        salePriceStartDate: values.salePriceStartDate?.toISOString() ?? null,
        salePriceEndDate: values.salePriceEndDate?.toISOString() ?? null,
        categoryId: values.categoryId,
        isActive: values.isActive ?? true,
        variants
      }

      if (editing) {
        await updateAdminProduct(editing.id, payload)
      } else {
        await createAdminProduct(payload)
      }

      toast.success(
        editing ? t('admin.productUpdated') : t('admin.productCreated')
      )
      setIsUploading(false)
      onSaved()
    } catch (error) {
      setIsUploading(false)
      const message =
        error instanceof Error
          ? error.message
          : t('message.error.processError')
      toast.error(message)
    }
  }

  return (
    <Modal
      title={editing ? `${t('common.update')} ${t('product.products').toLowerCase()}` : `${t('common.create')} ${t('product.products').toLowerCase()}`}
      open={open}
      onOk={save}
      cancelText={t('common.close')}
      okText={editing ? t('common.update') : t('common.create')}
      onCancel={onClose}
      okButtonProps={{ disabled: isUploading, loading: isUploading }}
      width={1000}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px' }
      }}
      destroyOnHidden
    >
      <Spin spinning={isUploading} description={t('admin.processing')}>
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
