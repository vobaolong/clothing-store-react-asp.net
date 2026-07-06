import {
  Form,
  Input,
  InputNumber,
  Modal,
  DatePicker,
  Switch,
  Upload,
  Select,
  TreeSelect
} from 'antd'
import { useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { createAdminBanner, updateAdminBanner } from '@/api/admin-api'
import { uploadImage } from '@/api/uploads-api'
import type { AdminBanner, AdminCategory, AdminProduct } from '@/types'
import type { RcFile } from 'antd/es/upload'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'
import {
  type BannerCtaDestination,
  buildBannerCtaLink,
  parseBannerCta
} from '@/utils/banner-cta-link'
import BannerPreviewPanel from '@/components/admin/BannerPreviewPanel'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  editing: AdminBanner | null
  categories: AdminCategory[]
  products: AdminProduct[]
  onDirty: () => void
  onClose: () => void
  onSaved: () => void
}

export default function BannerModal({
  open,
  editing,
  categories,
  products,
  onDirty,
  onClose,
  onSaved
}: Props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const destinationOptions: { value: BannerCtaDestination; label: string }[] = useMemo(() => [
    { value: 'category', label: t('admin.productFormBannerDestination') },
    { value: 'product', label: t('admin.productFormBannerDestinationProduct') },
    { value: 'search', label: t('admin.productFormBannerDestinationSearch') },
    { value: 'custom', label: t('admin.productFormBannerDestinationCustom') }
  ], [t])

  const categoryTreeData = useMemo(
    () => buildCategoryTreeSelectData(categories),
    [categories]
  )

  const productOptions = useMemo(() => {
    return [...products]
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      .map((p) => ({
        value: p.id,
        label: `${p.name} · ${p.slug}`
      }))
  }, [products])

  const destination = Form.useWatch('ctaDestination', form)

  const handleUpload = async (file: RcFile) => {
    try {
      const uploaded = await uploadImage(file, 'banners')
      form.setFieldValue('imageUrl', uploaded.url)
      toast.success(t('admin.uploadSuccess'))
    } catch {
      toast.error(t('admin.uploadFailed'))
    }
  }

  useEffect(() => {
    if (!open) return
    form.resetFields()
    if (editing) {
      const parsed = parseBannerCta(editing.ctaLink, categories, products)
      form.setFieldsValue({
        imageUrl: editing.imageUrl,
        isActive: editing.isActive,
        displayOrder: editing.displayOrder,
        startsAt: editing.startsAt ? dayjs(editing.startsAt) : undefined,
        endsAt: editing.endsAt ? dayjs(editing.endsAt) : undefined,
        ctaDestination: parsed.destination,
        ctaCategoryId: parsed.categoryId,
        ctaProductId: parsed.productId,
        ctaSearchKeyword: parsed.searchKeyword ?? '',
        ctaCustomUrl: parsed.customUrl ?? '/products'
      })
    } else {
      form.setFieldsValue({
        isActive: true,
        displayOrder: 0,
        ctaDestination: 'category',
        ctaSearchKeyword: '',
        ctaCustomUrl: '/products'
      })
    }
  }, [open, editing, form, categories, products])

  const save = async () => {
    const values = await form.validateFields()
    const dest = values.ctaDestination as BannerCtaDestination

    if (dest === 'category' && !values.ctaCategoryId) {
      toast.error(t('admin.selectCategory'))
      return
    }
    if (dest === 'product' && !values.ctaProductId) {
      toast.error(t('admin.selectProduct'))
      return
    }
    if (
      dest === 'search' &&
      !(values.ctaSearchKeyword && String(values.ctaSearchKeyword).trim())
    ) {
      toast.error(t('admin.enterKeyword'))
      return
    }
    if (
      dest === 'custom' &&
      !(values.ctaCustomUrl && String(values.ctaCustomUrl).trim())
    ) {
      toast.error(t('admin.enterUrl'))
      return
    }

    const ctaLink = buildBannerCtaLink(
      dest,
      values.ctaCategoryId,
      values.ctaProductId,
      values.ctaSearchKeyword,
      values.ctaCustomUrl,
      categories,
      products
    )

    const payload = {
      imageUrl: values.imageUrl,
      ctaLink,
      isActive: values.isActive ?? editing?.isActive ?? true,
      displayOrder: values.displayOrder ?? editing?.displayOrder ?? 0,
      startsAt: values.startsAt ? values.startsAt.toISOString() : null,
      endsAt: values.endsAt ? values.endsAt.toISOString() : null
    }
    if (editing) await updateAdminBanner(editing.id, payload)
    else await createAdminBanner(payload)
    toast.success(editing ? t('admin.bannerUpdated') : t('admin.bannerCreated'))
    onSaved()
  }

  return (
    <Modal
      title={editing ? t('admin.bannerEditTitle') : t('admin.bannerCreateTitle')}
      open={open}
      onOk={save}
      width={1000}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px' } }}
      onCancel={onClose}
      destroyOnHidden
      okText={editing ? t('admin.bannerSave') : t('admin.bannerAdd')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" onValuesChange={onDirty}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_500px]">
          <div>
            <Form.Item
              name="imageUrl"
              label={t('admin.bannerImageUrl')}
              rules={[{ required: true }]}
            >
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item label={t('admin.bannerUploadLabel')}>
              <Upload.Dragger
                name="image"
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  void handleUpload(file)
                  return false
                }}
              >
                <div className="py-4">
                  <p className="text-sm font-medium">
                    {t('admin.uploadDragText')}
                  </p>
                  <p className="text-xs text-slate-400">{t('admin.uploadHint')}</p>
                </div>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item
              name="ctaDestination"
              label={t('admin.linkCta')}
              rules={[{ required: true }]}
            >
              <Select options={destinationOptions} />
            </Form.Item>

            {destination === 'category' ? (
              <Form.Item
                name="ctaCategoryId"
                label={t('admin.selectCategory')}
                rules={[{ required: true, message: t('admin.selectCategory') }]}
              >
                <TreeSelect
                  className="w-full"
                  treeData={categoryTreeData}
                  placeholder={t('admin.chooseCategory')}
                  allowClear
                  showSearch
                  treeDefaultExpandAll
                  treeLine={{ showLeafIcon: false }}
                  filterTreeNode={(input, node) =>
                    String(node.title ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            ) : null}

            {destination === 'product' ? (
              <Form.Item
                name="ctaProductId"
                label={t('admin.selectProduct')}
                rules={[{ required: true, message: t('admin.selectProduct') }]}
              >
                <Select
                  className="w-full"
                  placeholder={t('admin.chooseProduct')}
                  options={productOptions}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            ) : null}

            {destination === 'search' ? (
              <Form.Item
                name="ctaSearchKeyword"
                label={t('admin.enterKeyword')}
                rules={[{ required: true, message: t('admin.enterKeyword') }]}
              >
                <Input placeholder={t('admin.searchKeywordPlaceholder')} />
              </Form.Item>
            ) : null}

            {destination === 'custom' ? (
              <Form.Item
                name="ctaCustomUrl"
                label={t('admin.bannerDestinationUrl')}
                rules={[{ required: true, message: t('admin.enterUrl') }]}
              >
                <Input placeholder={t('admin.customUrlPlaceholder')} />
              </Form.Item>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item name="startsAt" label={t('admin.bannerStartDate')}>
                <DatePicker
                  showTime
                  format="HH:mm DD/MM/YYYY"
                  className="w-full"
                  placeholder={t('admin.chooseDate')}
                />
              </Form.Item>
              <Form.Item name="endsAt" label={t('admin.bannerEndDate')}>
                <DatePicker
                  showTime
                  format="HH:mm DD/MM/YYYY"
                  className="w-full"
                  placeholder={t('admin.chooseDate')}
                />
              </Form.Item>
            </div>
            <Form.Item
              name="isActive"
              label={t('common.active')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="displayOrder"
              label={t('admin.displayOrder')}
              tooltip={t('admin.displayOrderTooltip')}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>

          <BannerPreviewPanel form={form} />
        </div>
      </Form>
    </Modal>
  )
}
