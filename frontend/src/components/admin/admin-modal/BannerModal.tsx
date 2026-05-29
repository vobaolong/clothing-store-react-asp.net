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

type Props = {
  open: boolean
  editing: AdminBanner | null
  categories: AdminCategory[]
  products: AdminProduct[]
  onDirty: () => void
  onClose: () => void
  onSaved: () => void
}

const DESTINATION_OPTIONS: { value: BannerCtaDestination; label: string }[] = [
  { value: 'category', label: 'Danh mục (trang danh sách)' },
  { value: 'product', label: 'Sản phẩm (trang chi tiết)' },
  { value: 'search', label: 'Từ khóa tìm kiếm' },
  { value: 'custom', label: 'Đường dẫn / URL tùy chỉnh' }
]

export default function BannerModal({
  open,
  editing,
  categories,
  products,
  onDirty,
  onClose,
  onSaved
}: Props) {
  const [form] = Form.useForm()

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
      toast.success('Đã tải lên ảnh')
    } catch {
      toast.error('Không thể tải ảnh lên')
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
      toast.error('Chọn một danh mục')
      return
    }
    if (dest === 'product' && !values.ctaProductId) {
      toast.error('Chọn một sản phẩm')
      return
    }
    if (
      dest === 'search' &&
      !(values.ctaSearchKeyword && String(values.ctaSearchKeyword).trim())
    ) {
      toast.error('Nhập từ khóa tìm kiếm')
      return
    }
    if (
      dest === 'custom' &&
      !(values.ctaCustomUrl && String(values.ctaCustomUrl).trim())
    ) {
      toast.error('Nhập đường dẫn hoặc URL')
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
    toast.success(editing ? 'Đã cập nhật banner' : 'Đã tạo banner')
    onSaved()
  }

  return (
    <Modal
      title={editing ? 'Sửa Banner' : 'Tạo Banner'}
      open={open}
      onOk={save}
      width={1000}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      onCancel={onClose}
      destroyOnHidden
      okText={editing ? 'Lưu' : 'Thêm'}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onValuesChange={onDirty}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_500px]">
          <div>
            <Form.Item
              name="imageUrl"
              label="URL ảnh"
              rules={[{ required: true }]}
            >
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item label="Hoặc tải ảnh lên">
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
                    Click hoặc kéo ảnh để tải lên
                  </p>
                  <p className="text-xs text-slate-400">JPG, PNG, GIF, etc.</p>
                </div>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item
              name="ctaDestination"
              label="Liên kết CTA"
              rules={[{ required: true }]}
            >
              <Select options={DESTINATION_OPTIONS} />
            </Form.Item>

            {destination === 'category' ? (
              <Form.Item
                name="ctaCategoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Chọn danh mục' }]}
              >
                <TreeSelect
                  className="w-full"
                  treeData={categoryTreeData}
                  placeholder="Chọn danh mục"
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
                label="Sản phẩm"
                rules={[{ required: true, message: 'Chọn sản phẩm' }]}
              >
                <Select
                  className="w-full"
                  placeholder="Tìm và chọn sản phẩm"
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
                label="Từ khóa"
                rules={[{ required: true, message: 'Nhập từ khóa' }]}
              >
                <Input placeholder="VD: áo thun, worldcup…" />
              </Form.Item>
            ) : null}

            {destination === 'custom' ? (
              <Form.Item
                name="ctaCustomUrl"
                label="Đường dẫn hoặc URL đầy đủ"
                rules={[{ required: true, message: 'Nhập đường dẫn' }]}
              >
                <Input placeholder="/products?sort=newest hoặc https://…" />
              </Form.Item>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item name="startsAt" label="Thời gian bắt đầu">
                <DatePicker
                  showTime
                  format="HH:mm DD/MM/YYYY"
                  className="w-full"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
              <Form.Item name="endsAt" label="Thời gian kết thúc">
                <DatePicker
                  showTime
                  format="HH:mm DD/MM/YYYY"
                  className="w-full"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </div>
            <Form.Item
              name="isActive"
              label="Kích hoạt"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="displayOrder"
              label="Thứ tự hiển thị"
              tooltip="Số nhỏ hơn sẽ hiển thị trước. VD: 0 → 1 → 2…"
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
