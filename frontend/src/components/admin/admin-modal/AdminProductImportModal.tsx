import { InboxOutlined } from '@ant-design/icons'
import { Alert, Descriptions, Modal, Typography, Upload } from 'antd'
import type { UploadFile } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  importAdminProducts,
  getAdminApiErrorMessage
} from '@/api/admin-api'
import type { AdminProductImportResult } from '@/types'

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
      toast.error('Vui lòng chọn file Excel trước khi nhập')
      return
    }

    try {
      setIsImporting(true)
      const response = await importAdminProducts(selectedFile)
      setResult(response)
      await onImported()
      toast.success('Nhập Excel hoàn tất')
    } catch (error) {
      toast.error(getAdminApiErrorMessage(error) ?? 'Nhập Excel thất bại')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Nhập Excel"
      onCancel={onClose}
      afterClose={resetState}
      onOk={handleImport}
      okText="Nhập"
      cancelText="Đóng"
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
          Tải lên file .xlsx hoặc .xls. Mỗi dòng Excel đại diện cho một biến thể
          sản phẩm theo size/màu, không phải dữ liệu cấp sản phẩm.
        </Typography.Paragraph>

        <Upload.Dragger
          accept=".xlsx,.xls"
          fileList={fileList}
          maxCount={1}
          beforeUpload={(file) => {
            if (!isExcelFile(file)) {
              toast.error('Chỉ hỗ trợ file .xlsx hoặc .xls')
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
          <p className="ant-upload-text">Kéo thả hoặc bấm để chọn file Excel</p>
          <p className="ant-upload-hint">Hỗ trợ .xlsx và .xls</p>
        </Upload.Dragger>

        {selectedFile ? (
          <Alert
            type="info"
            showIcon
            message={`Đã chọn: ${selectedFile.name}`}
            className="mb-0"
          />
        ) : null}

        {result ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Typography.Title level={5} className="mb-3!">
              Kết quả nhập
            </Typography.Title>
            <Descriptions size="small" bordered column={2}>
              <Descriptions.Item label="Tổng số dòng">
                {result.totalRows}
              </Descriptions.Item>
              <Descriptions.Item label="Sản phẩm nhập">
                {result.productsImported}
              </Descriptions.Item>
              <Descriptions.Item label="Biến thể nhập">
                {result.variantsImported}
              </Descriptions.Item>
              <Descriptions.Item label="Dòng lỗi">
                {result.failedRows}
              </Descriptions.Item>
              <Descriptions.Item label="Sản phẩm phát hiện">
                {result.totalProductsDetected}
              </Descriptions.Item>
            </Descriptions>

            {result.errors.length > 0 ? (
              <div className="mt-4">
                <Typography.Text strong className="block mb-2">
                  Lỗi theo từng dòng
                </Typography.Text>
                <div className="overflow-auto max-h-64 bg-white rounded-md border border-red-200">
                  <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 text-red-700 bg-red-50">
                      <tr>
                        <th className="py-2 px-3">Dòng</th>
                        <th className="py-2 px-3">Lỗi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((errorRow: ImportErrorRow) => (
                        <tr
                          key={`${errorRow.rowNumber}-${errorRow.error}`}
                          className="border-t"
                        >
                          <td className="py-2 px-3 font-medium align-top">
                            {errorRow.rowNumber}
                          </td>
                          <td className="py-2 px-3">{errorRow.error}</td>
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
                title="Không có lỗi theo dòng"
                className="mt-4"
              />
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
