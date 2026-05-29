import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons'
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  TreeSelect,
  Upload
} from 'antd'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { bulkCreateAdminCategories } from '@/api/admin-api'
import { uploadImage } from '@/api/uploads-api'
import { CategoryGender, CategoryProductType } from '@/enums'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'
import type { AdminCategory } from '@/types'
import { toCapitalize } from '@/utils/table.lib'

type BulkCategoryImageFieldProps = {
  value?: string
  onChange?: (value: string) => void
  onDirty: () => void
}

function BulkCategoryImageField({
  value,
  onChange,
  onDirty
}: BulkCategoryImageFieldProps) {
  const raw = value ?? ''

  const uploadFileIntoField = async (file: File) => {
    try {
      const uploaded = await uploadImage(file, 'categories')
      onChange?.(uploaded.url)
      onDirty()
      toast.success('Image uploaded')
    } catch (err) {
      toast.error((err as Error).message || 'Could not upload image file')
    }
  }

  return (
    <Space.Compact className="w-full!">
      <Input
        className="flex-1 min-w-0"
        value={raw}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="https://…"
        allowClear
      />
      <Upload
        accept="image/*"
        maxCount={1}
        showUploadList={false}
        beforeUpload={(file) => {
          void uploadFileIntoField(file)
          return false
        }}
      >
        <Button
          type="default"
          htmlType="button"
          icon={<UploadOutlined />}
          aria-label="Upload image"
        />
      </Upload>
    </Space.Compact>
  )
}

type Props = {
  open: boolean
  categories: AdminCategory[]
  onDirty: () => void
  onClose: () => void
  onSaved: () => void
}

export default function BulkCategoriesModal({
  open,
  categories,
  onDirty,
  onClose,
  onSaved
}: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const parentTreeData = useMemo(
    () => buildCategoryTreeSelectData(categories),
    [categories]
  )

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue({
      items: [{ name: '', image: '', description: '' }],
      parentId: undefined,
      gender: CategoryGender.UNISEX,
      productType: CategoryProductType.CLOTHING,
      isActive: true
    })
  }, [open, form])

  const save = async () => {
    const values = await form.validateFields()
    const rawItems = (values.items ?? []) as Array<{
      name?: string
      image?: string
      description?: string
    }>
    const items = rawItems
      .map((row) => ({
        name: String(row?.name ?? '').trim(),
        image: row?.image?.trim() || undefined,
        description: row?.description?.trim() || undefined
      }))
      .filter((row) => row.name.length > 0)

    if (items.length === 0) {
      toast.error('Add at least one category name')
      return
    }

    setSubmitting(true)
    try {
      await bulkCreateAdminCategories({
        items,
        parentId: values.parentId || null,
        gender: values.gender,
        productType: values.productType || undefined,
        isActive: values.isActive
      })
      toast.success('Categories created')
      onSaved()
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) &&
        err.response?.data &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data
          ? String((err.response.data as { message: unknown }).message)
          : 'Bulk create failed'
      toast.error(msg)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Bulk add categories"
      open={open}
      onOk={save}
      onCancel={onClose}
      okText="Create all"
      confirmLoading={submitting}
      width={720}
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" onValuesChange={onDirty}>
        <Form.Item name="parentId" label="Parent category">
          <TreeSelect
            className="w-full!"
            allowClear
            placeholder="Chọn danh mục cha"
            showSearch={{ treeNodeFilterProp: 'title' }}
            treeDefaultExpandAll
            treeLine={{ showLeafIcon: false }}
            treeData={parentTreeData}
            styles={{ popup: { root: { maxHeight: 400 } } }}
          />
        </Form.Item>
        <Form.Item name="gender" label="Gender">
          <Select
            allowClear
            options={Object.values(CategoryGender).map((value) => ({
              label: toCapitalize(value),
              value
            }))}
          />
        </Form.Item>
        <Form.Item name="productType" label="Product type">
          <Select
            allowClear
            options={Object.values(CategoryProductType).map((value) => ({
              label: toCapitalize(value),
              value
            }))}
          />
        </Form.Item>

        <Form.Item label="Categories (name + image per row)" required>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="p-3 border rounded-lg border-slate-200 bg-slate-50/80"
                  >
                    <Space wrap className="w-full" align="start">
                      <Form.Item
                        name={[field.name, 'name']}
                        label="Name"
                        className="flex-1 mb-0 min-w-35"
                      >
                        <Input placeholder="Category name" />
                      </Form.Item>
                      <Form.Item
                        label="Image URL"
                        className="flex-1 mb-0 min-w-45"
                      >
                        <Form.Item name={[field.name, 'image']} noStyle>
                          <BulkCategoryImageField onDirty={onDirty} />
                        </Form.Item>
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'description']}
                        label="Description"
                        className="flex-1 mb-0 min-w-40"
                      >
                        <Input placeholder="Optional" allowClear />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          aria-label="Remove row"
                          className="mt-7 shrink-0"
                          onClick={() => {
                            remove(field.name)
                            onDirty()
                          }}
                        />
                      ) : null}
                    </Space>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => {
                    add({ name: '', image: '', description: '' })
                    onDirty()
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  Add row
                </Button>
              </div>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
          initialValue
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  )
}
