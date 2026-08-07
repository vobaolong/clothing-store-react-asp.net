import { InboxOutlined } from '@ant-design/icons'
import { Alert, Descriptions, Modal, Typography, Upload } from 'antd'
import type { UploadFile } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  importAdminProducts
} from '@/api/admin-api'
import { getApiErrorMessage } from '@/utils/error-handler'
import type { AdminProductImportResult } from '@/types'
import { useTranslation } from 'react-i18next'

type AdminProductImportModalProps = {
  open: boolean
  onClose: () => void
  onImported: () => Promise<void>
}

type ImportErrorRow = AdminProductImportResult['errors'][number]

function isExcelFile(file: RcFile) {
  const fileName = file.name.toLowerCase()
  return fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
}

export default function AdminProductImportModal({
  open,
  onClose,
  onImported
}: AdminProductImportModalProps) {
  const { t } = useTranslation()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [result, setResult] = useState<AdminProductImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const resetState = () => {
    setFileList([])
    setResult(null)
    setIsImporting(false)
  }

  const selectedFile = useMemo(
    () => fileList[0]?.originFileObj ?? null,
    [fileList]
  )

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error(t('admin.importSelectFile'))
      return
    }

    try {
      setIsImporting(true)
      const response = await importAdminProducts(selectedFile)
      setResult(response)
      await onImported()
      toast.success(t('admin.productImportSuccess'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('admin.productImportFailed')))
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={t('admin.importTitle')}
      onCancel={onClose}
      afterClose={resetState}
      onOk={handleImport}
      okText={t('admin.importOk')}
      cancelText={t('admin.importCancel')}
      okButtonProps={{
        disabled: !selectedFile || isImporting,
        loading: isImporting
      }}
      destroyOnHidden={false}
      width={720}
    >
      <div className="space-y-4">
        <Typography.Paragraph
          type="secondary"
          className="mb-0 text-sm text-gray-600"
        >
          {t('admin.importDescription')}
        </Typography.Paragraph>

        <Upload.Dragger
          accept=".xlsx,.xls"
          fileList={fileList}
          maxCount={1}
          beforeUpload={(file) => {
            if (!isExcelFile(file)) {
              toast.error(t('admin.importFileTypeError'))
              return Upload.LIST_IGNORE
            }

            setResult(null)
            setFileList([
              {
                uid: file.uid,
                name: file.name,
                status: 'done',
                originFileObj: file
              }
            ])
            return false
          }}
          onRemove={() => {
            setFileList([])
            setResult(null)
          }}
          showUploadList={{ showRemoveIcon: true }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t('admin.importDragText')}</p>
          <p className="ant-upload-hint">{t('admin.importHint')}</p>
        </Upload.Dragger>

        {selectedFile ? (
          <Alert
            type="info"
            showIcon
            message={t('admin.fileSelected', { name: selectedFile.name })}
            className="mb-0"
          />
        ) : null}

        {result ? (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <Typography.Title level={5} className="mb-3!">
              {t('admin.importResultTitle')}
            </Typography.Title>
            <Descriptions size="small" bordered column={2}>
              <Descriptions.Item label={t('admin.importTotalRows')}>
                {result.totalRows}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.importProductsImported')}>
                {result.productsImported}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.importVariantsImported')}>
                {result.variantsImported}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.importFailedRows')}>
                {result.failedRows}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.importProductsDetected')}>
                {result.totalProductsDetected}
              </Descriptions.Item>
            </Descriptions>

            {result.errors.length > 0 ? (
              <div className="mt-4">
                <Typography.Text strong className="block mb-2">
                  {t('admin.importRowErrors')}
                </Typography.Text>
                <div className="overflow-auto bg-white border border-red-200 max-h-64 rounded-md">
                  <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 text-red-700 bg-red-50">
                      <tr>
                        <th className="px-3 py-2">{t('admin.importFailedRows')}</th>
                        <th className="px-3 py-2">{t('common.error')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((errorRow: ImportErrorRow) => (
                        <tr
                          key={`${errorRow.rowNumber}-${errorRow.error}`}
                          className="border-t"
                        >
                          <td className="px-3 py-2 font-medium align-top">
                            {errorRow.rowNumber}
                          </td>
                          <td className="px-3 py-2">{errorRow.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Alert
                type="success"
                showIcon
                title={t('admin.importNoErrors')}
                className="mt-4"
              />
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
