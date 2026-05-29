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

const GENDER_OPTIONS = Object.values(CategoryGender).map((value) => ({
  label: toCapitalize(value),
  value
}))

const PRODUCT_TYPE_OPTIONS = Object.values(CategoryProductType).map(
  (value) => ({
    label: toCapitalize(value),
    value
  })
)

export default function CategoryModal({
  open,
  editing,
  onDirty,
  onClose,
  onSaved
}: Props) {
  const [form] = Form.useForm()
  const [isSaving, setIsSaving] = useState(false)
  const [modalState, setModalState] = useState({
    parentTreeData: [] as CategoryTreeNode[],
    isLoadingParents: false
  })

  const save = useCallback(async () => {
    try {
      setIsSaving(true)
      const values = await form.validateFields()
      let imageUrl = values.imageUrlInput?.trim() || ''

      const fileList = values.imageUpload as UploadFile[] | undefined
      const selectedFile = fileList?.[0]

      if (selectedFile?.originFileObj) {
        const uploaded = await uploadImage(
          selectedFile.originFileObj,
          'categories'
        )
        imageUrl = uploaded.url
      } else if (!imageUrl && selectedFile?.url) {
        imageUrl = selectedFile.url
      }

      if (!imageUrl) {
        toast.error('Please select or enter a category image')
        return
      }

      const payload = {
        name: values.name,
        image: imageUrl,
        description: values.description?.trim() || undefined,
        parentId: values.parentId || null,
        level: values.parentId ? 1 : 0,
        gender: values.gender,
        productType: values.productType || undefined,
        isActive: Boolean(values.isActive)
      }

      if (editing) {
        await updateAdminCategory(editing.id, payload)
      } else {
        await createAdminCategory(payload)
      }

      toast.success(editing ? 'Category updated' : 'Category created')
      onSaved()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return // Form validation fail
      toast.error((error as Error).message || 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }, [form, editing, onSaved])

  useEffect(() => {
    if (!open) return

    form.resetFields()
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        description: editing.description ?? '',
        parentId: editing.parentId ?? undefined,
        gender: editing.gender ?? CategoryGender.UNISEX,
        productType: editing.productType ?? CategoryProductType.CLOTHING,
        isActive: editing.isActive,
        imageUrlInput: editing.image,
        imageUpload: editing.image
          ? [
              {
                uid: `existing-${editing.id}`,
                name: 'image',
                status: 'done',
                url: editing.image
              }
            ]
          : []
      })
    } else {
      form.setFieldsValue({
        parentId: undefined,
        gender: CategoryGender.UNISEX,
        productType: CategoryProductType.CLOTHING,
        isActive: true,
        imageUpload: []
      })
    }
  }, [open, editing, form])

  const handleAfterOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setModalState({ parentTreeData: [], isLoadingParents: false })
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
  }

  const normFile = (e: { fileList: UploadFile[] }) => {
    if (Array.isArray(e)) return e
    return e?.fileList
  }

  return (
    <Modal
      title={editing ? 'Edit Category' : 'Create Category'}
      open={open}
      onOk={save}
      onCancel={onClose}
      confirmLoading={isSaving}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      afterOpenChange={handleAfterOpenChange}
    >
      <Form form={form} layout="vertical" onValuesChange={onDirty}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="parentId" label="Parent Category">
          <TreeSelect
            className="w-full"
            allowClear
            placeholder="Chọn danh mục cha"
            loading={modalState.isLoadingParents}
            showSearch={{ treeNodeFilterProp: 'title' }}
            treeDefaultExpandAll
            treeLine={{ showLeafIcon: false }}
            treeData={modalState.parentTreeData}
            styles={{ popup: { root: { maxHeight: 400 } } }}
          />
        </Form.Item>

        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select options={GENDER_OPTIONS} />
        </Form.Item>

        <Form.Item name="productType" label="Product Type">
          <Select allowClear options={PRODUCT_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item label="Image" required>
          <div className="space-y-3">
            <Form.Item
              name="imageUpload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Upload.Dragger
                accept="image/*"
                maxCount={1}
                beforeUpload={() => false} // Chặn việc tự động đẩy lên server vô tội vạ
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag image to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single upload. You can also enter an image URL
                  below.
                </p>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item
              name="imageUrlInput"
              label="Or enter image URL"
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="https://example.com/image.jpg" allowClear />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Is Active"
          valuePropName="checked"
          initialValue={true}
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  )
}
