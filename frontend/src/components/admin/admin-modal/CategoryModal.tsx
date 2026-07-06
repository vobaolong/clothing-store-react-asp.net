import { Form, Input, Modal, Select, Switch, TreeSelect, Upload } from 'antd'
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
import { CategoryGender, CategoryType } from '@/enums'
import {
  buildCategoryTreeSelectData,
  collectDescendantCategoryIds,
  type CategoryTreeNode
} from '@/utils/category-tree'
import { useAdminFilterOptions } from '@/options/admin-filter.options'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  editing: AdminCategory | null
  onDirty: () => void
  onClose: () => void
  onSaved: () => void
}

export default function CategoryModal({
  open,
  editing,
  onDirty,
  onClose,
  onSaved
}: Props) {
  const { t } = useTranslation()
  const { categoryGender, categoryType } = useAdminFilterOptions()
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
        toast.error(t('admin.categoryImageRequired'))
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

      toast.success(
        editing ? t('admin.categoryUpdatedSuccess') : t('admin.categoryCreated')
      )
      onSaved()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      toast.error((error as Error).message || t('admin.categorySaveError'))
    } finally {
      setIsSaving(false)
    }
  }, [form, editing, onSaved, t])

  useEffect(() => {
    if (!open) return

    form.resetFields()
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        description: editing.description ?? '',
        parentId: editing.parentId ?? undefined,
        gender: editing.gender ?? CategoryGender.UNISEX,
        productType: editing.productType ?? CategoryType.CLOTHING,
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
        productType: CategoryType.CLOTHING,
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
      title={
        editing ? t('admin.categoryEditTitle') : t('admin.categoryCreateTitle')
      }
      open={open}
      onOk={save}
      onCancel={onClose}
      okText={editing ? t('common.update') : t('common.create')}
      cancelText={t('common.cancel')}
      confirmLoading={isSaving}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px' }
      }}
      afterOpenChange={handleAfterOpenChange}
    >
      <Form form={form} layout="vertical" onValuesChange={onDirty}>
        <Form.Item
          name="name"
          label={t('admin.categoryNameLabel')}
          rules={[{ required: true, message: t('admin.categoryNameRequired') }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('admin.categoryDescriptionLabel')}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="parentId" label={t('admin.categoryParentLabel')}>
          <TreeSelect
            className="w-full"
            allowClear
            placeholder={t('admin.categoryParentPlaceholder')}
            loading={modalState.isLoadingParents}
            showSearch={{ treeNodeFilterProp: 'title' }}
            treeDefaultExpandAll
            treeLine={{ showLeafIcon: false }}
            treeData={modalState.parentTreeData}
            styles={{ popup: { root: { maxHeight: 400 } } }}
          />
        </Form.Item>

        <Form.Item
          name="gender"
          label={t('admin.categoryGenderLabel')}
          rules={[{ required: true }]}
        >
          <Select options={categoryGender} />
        </Form.Item>

        <Form.Item name="productType" label={t('admin.categoryTypeLabel')}>
          <Select allowClear options={categoryType} />
        </Form.Item>

        <Form.Item label={t('admin.categoryImageLabel')} required>
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
                beforeUpload={() => false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  {t('admin.categoryUploadText')}
                </p>
                <p className="ant-upload-hint">
                  {t('admin.categoryUploadHint')}
                </p>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item name="imageUrlInput" label={t('common.or')}>
              <Input
                placeholder={t('admin.categoryImageUrlPlaceholder')}
                allowClear
              />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item
          name="isActive"
          label={t('admin.categoryActiveLabel')}
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
