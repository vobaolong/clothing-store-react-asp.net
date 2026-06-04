import { PlusOutlined } from '@ant-design/icons'
import { Button, Input, InputNumber, Tag, Upload } from 'antd'
import type { FormInstance, UploadFile } from 'antd'
import {
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import type { ProductFormValues, QuantityMap } from '@/types'
import { CategoryType } from '@/enums'
import {
  DEFAULT_COLORS,
  DEFAULT_SIZES,
  DEFAULT_SHOE_SIZES
} from '@/constants/product.constant'

const { CheckableTag } = Tag

type ColorOption = {
  name: string
  hex: string
}

export type AdminVariantsMatrixFieldHandle = {
  getColorGalleryFiles: () => Record<string, UploadFile[]>
}

export type AdminVariantsMatrixFieldProps = {
  form: FormInstance<ProductFormValues>
  productType?: CategoryType
  modalOpen?: boolean
  editingProductId?: string
}

const variantKey = (color: string, size: string) => `${color}__${size}`
let _uid = 0
const nextUid = () => String(++_uid)

function urlsToUploadFiles(colorName: string, urls: string[]): UploadFile[] {
  return urls.map((url, index) => ({
    uid: `preset-${colorName}-${nextUid()}`,
    name: `image-${index + 1}.jpg`,
    status: 'done' as const,
    url,
    thumbUrl: url
  }))
}

function buildFromVariants(
  variants: ProductFormValues['variants'],
  isAccessories = false
) {
  const colors: ColorOption[] = []
  const colorSet = new Set<string>()
  const sizes: string[] = []
  const sizeSet = new Set<string>()
  const quantities: QuantityMap = {}

  for (const variant of variants) {
    const color = variant.color.trim()
    const size = variant.size.trim()
    const hex = variant.hex?.trim() || '#000000'

    if (color && !colorSet.has(color)) {
      colors.push({ name: color, hex })
      colorSet.add(color)
    }
    if (!isAccessories && size && !sizeSet.has(size)) {
      sizes.push(size)
      sizeSet.add(size)
    }
    if (color && (isAccessories || size)) {
      quantities[variantKey(color, size)] = Number(variant.quantity) || 0
    }
  }

  return { colors, sizes, quantities }
}

function extractColorGalleries(
  variants: ProductFormValues['variants']
): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const v of variants) {
    const color = v.color?.trim()
    if (!color || map[color] !== undefined) continue
    const fromList = v.imageUrls?.map((u) => u.trim()).filter(Boolean) ?? []
    const fromSingle = v.imageUrl?.trim()
    map[color] =
      fromList.length > 0
        ? [...new Set(fromList)]
        : fromSingle
          ? [fromSingle]
          : []
  }
  return map
}

function mergeVariantImageUrls(
  variant: ProductFormValues['variants'][number]
): string[] {
  const fromList = variant.imageUrls?.map((u) => u.trim()).filter(Boolean) ?? []
  const fromSingle = variant.imageUrl?.trim()
  return fromList.length > 0
    ? [...new Set(fromList)]
    : fromSingle
      ? [fromSingle]
      : []
}

const normalizeVariants = (
  variants: ProductFormValues['variants']
): ProductFormValues['variants'] =>
  variants
    .map((variant) => {
      const urls = mergeVariantImageUrls(variant)
      return {
        size: variant.size?.trim() ?? '',
        color: variant.color.trim(),
        hex: variant.hex.trim(),
        quantity: Number(variant.quantity) || 0,
        imageUrl: urls[0] ?? null,
        imageUrls: urls.length > 0 ? urls : null
      }
    })
    .sort((a, b) =>
      `${a.color}-${a.size}`.localeCompare(`${b.color}-${b.size}`)
    )

function initGalleryFiles(
  variants: ProductFormValues['variants']
): Record<string, UploadFile[]> {
  const { colors } = buildFromVariants(variants)
  const galleries = extractColorGalleries(variants)
  const files: Record<string, UploadFile[]> = {}
  for (const color of colors) {
    files[color.name] = urlsToUploadFiles(
      color.name,
      galleries[color.name] ?? []
    )
  }
  return files
}

export default forwardRef<
  AdminVariantsMatrixFieldHandle,
  AdminVariantsMatrixFieldProps
>(function AdminVariantsMatrixField(
  {
    form,
    productType,
    modalOpen,
    editingProductId
  }: AdminVariantsMatrixFieldProps,
  ref
) {
  const isAccessories = productType === CategoryType.ACCESSORIES
  const initialVariants: ProductFormValues['variants'] =
    form.getFieldValue('variants') ?? []

  const [matrixData, setMatrixData] = useState(() => {
    const built = buildFromVariants(initialVariants)
    return {
      colors: built.colors,
      sizes: isAccessories ? [] : built.sizes,
      quantities: built.quantities,
      galleryFiles: initGalleryFiles(initialVariants),
      urlDrafts: {} as Record<string, string>
    }
  })

  const [formInputs, setFormInputs] = useState({
    newColorName: '',
    newColorHex: '#000000',
    newSize: '',
    bulkQuantity: 0
  })

  const [uiState, setUiState] = useState({
    showCustomColor: false,
    showCustomSize: false
  })

  useImperativeHandle(ref, () => ({
    getColorGalleryFiles: () => matrixData.galleryFiles
  }))

  useEffect(() => {
    if (modalOpen !== true) return
    const timer = window.setTimeout(() => {
      const raw = form.getFieldValue('variants') ?? []
      if (!raw.length) return
      const built = buildFromVariants(raw, isAccessories)
      setMatrixData({
        colors: built.colors,
        sizes: isAccessories ? [] : built.sizes,
        quantities: built.quantities,
        galleryFiles: initGalleryFiles(raw),
        urlDrafts: {}
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [modalOpen, editingProductId, form, isAccessories])

  const matrixVariants = useMemo<ProductFormValues['variants']>(() => {
    if (!matrixData.colors.length) return []
    if (!isAccessories && !matrixData.sizes.length) return []

    return matrixData.colors.flatMap((color) => {
      const previewUrls = (matrixData.galleryFiles[color.name] ?? [])
        .filter((f) => f.status !== 'removed')
        .map((f) => f.thumbUrl ?? f.url ?? '')
        .filter(Boolean)

      if (isAccessories) {
        return [
          {
            color: color.name,
            hex: color.hex,
            size: '',
            quantity: matrixData.quantities[variantKey(color.name, '')] ?? 0,
            ...(previewUrls.length
              ? { imageUrl: previewUrls[0], imageUrls: previewUrls }
              : {})
          }
        ]
      }

      return matrixData.sizes.map((size) => ({
        color: color.name,
        hex: color.hex,
        size,
        quantity: matrixData.quantities[variantKey(color.name, size)] ?? 0,
        ...(previewUrls.length
          ? { imageUrl: previewUrls[0], imageUrls: previewUrls }
          : {})
      }))
    })
  }, [matrixData, isAccessories])

  useEffect(() => {
    form.setFieldsValue({ variants: normalizeVariants(matrixVariants) })
  }, [form, matrixVariants])

  const addColor = () => {
    const name = formInputs.newColorName.trim()
    if (!name) return
    if (
      matrixData.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())
    )
      return
    setMatrixData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name, hex: formInputs.newColorHex }]
    }))
    setFormInputs((prev) => ({
      ...prev,
      newColorName: '',
      newColorHex: '#000000'
    }))
    setUiState((prev) => ({ ...prev, showCustomColor: false }))
  }

  const toggleColor = (colorObj: ColorOption) => {
    const isSelected = matrixData.colors.some((c) => c.name === colorObj.name)
    setMatrixData((prev) => {
      if (isSelected) {
        const nextGallery = { ...prev.galleryFiles }
        const nextDrafts = { ...prev.urlDrafts }
        delete nextGallery[colorObj.name]
        delete nextDrafts[colorObj.name]
        return {
          ...prev,
          colors: prev.colors.filter((c) => c.name !== colorObj.name),
          galleryFiles: nextGallery,
          urlDrafts: nextDrafts
        }
      }
      return { ...prev, colors: [...prev.colors, colorObj] }
    })
  }

  const addSize = () => {
    const value = formInputs.newSize.trim().toUpperCase()
    if (!value || matrixData.sizes.includes(value)) return
    setMatrixData((prev) => ({ ...prev, sizes: [...prev.sizes, value] }))
    setFormInputs((prev) => ({ ...prev, newSize: '' }))
    setUiState((prev) => ({ ...prev, showCustomSize: false }))
  }

  const toggleSize = (size: string) => {
    setMatrixData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const applyBulkQuantity = () => {
    const qty = Math.max(0, Number(formInputs.bulkQuantity) || 0)
    const next: QuantityMap = {}
    matrixData.colors.forEach((color) => {
      if (isAccessories) {
        next[variantKey(color.name, '')] = qty
      } else {
        matrixData.sizes.forEach((size) => {
          next[variantKey(color.name, size)] = qty
        })
      }
    })
    setMatrixData((prev) => ({ ...prev, quantities: next }))
  }

  const handleUploadChange = (colorName: string, fileList: UploadFile[]) => {
    const withPreviews = fileList.map((f) => {
      if (f.originFileObj && !f.thumbUrl) {
        return { ...f, thumbUrl: URL.createObjectURL(f.originFileObj) }
      }
      return f
    })
    setMatrixData((prev) => ({
      ...prev,
      galleryFiles: { ...prev.galleryFiles, [colorName]: withPreviews }
    }))
  }

  const appendColorUrl = (colorName: string) => {
    const url = (matrixData.urlDrafts[colorName] ?? '').trim()
    if (!url) return
    const newFile: UploadFile = {
      uid: `url-${colorName}-${nextUid()}`,
      name: 'URL',
      status: 'done',
      url,
      thumbUrl: url
    }
    setMatrixData((prev) => ({
      ...prev,
      galleryFiles: {
        ...prev.galleryFiles,
        [colorName]: [...(prev.galleryFiles[colorName] ?? []), newFile]
      },
      urlDrafts: { ...prev.urlDrafts, [colorName]: '' }
    }))
  }

  const customColors = matrixData.colors.filter(
    (c) => !DEFAULT_COLORS.some((d) => d.name === c.name)
  )

  const customSizes = matrixData.sizes.filter((s) => {
    const availableSizes =
      productType === CategoryType.SHOES ? DEFAULT_SHOE_SIZES : DEFAULT_SIZES
    return !(availableSizes as string[]).includes(s)
  })

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-xl border-slate-200 bg-slate-50/30">
        <p className="mb-3 text-sm font-semibold text-slate-800">Màu sắc</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {DEFAULT_COLORS.map((colorOption) => (
            <CheckableTag
              key={colorOption.hex}
              checked={matrixData.colors.some(
                (c) => c.name === colorOption.name
              )}
              onChange={() => toggleColor(colorOption)}
              className="m-0! items-center! justify-center! gap-1.5! h-7! leading-3! p-0! px-2.5! rounded-full border border-slate-300! bg-white text-xs transition-all"
              style={{ display: 'flex' }}
            >
              <span
                className="inline-block mr-1 w-3 h-3 align-middle rounded-full border shrink-0 border-slate-300"
                style={{ backgroundColor: colorOption.hex }}
              />
              <span className="inline-block leading-none align-middle">
                {colorOption.name}
              </span>
            </CheckableTag>
          ))}

          {customColors.map((color) => (
            <Tag
              key={color.name}
              closable
              onClose={() => toggleColor(color)}
              className="flex items-center! gap-2 px-3 text-sm text-white! rounded-full border-blue-200! border! bg-[#1677ff]! h-7!"
            >
              <span
                className="inline-block mr-1 w-3 h-3 align-middle rounded-full border shrink-0 border-slate-300"
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
            </Tag>
          ))}

          <Button
            type="default"
            size="small"
            variant="outlined"
            danger
            icon={<PlusOutlined />}
            onClick={() => setUiState((p) => ({ ...p, showCustomColor: true }))}
            className="rounded-full h-7!"
          >
            Thêm
          </Button>
        </div>

        {uiState.showCustomColor && (
          <div className="flex gap-2 items-center p-3 bg-white rounded-lg border border-blue-100! shadow-sm">
            <Input
              placeholder="Tên màu sắc (ví dụ: Xanh olive)"
              value={formInputs.newColorName}
              onChange={(e) =>
                setFormInputs((p) => ({ ...p, newColorName: e.target.value }))
              }
              onPressEnter={addColor}
              className="max-w-50"
            />
            <input
              type="color"
              value={formInputs.newColorHex}
              onChange={(e) =>
                setFormInputs((p) => ({ ...p, newColorHex: e.target.value }))
              }
              className="p-0 w-10 h-8 bg-white rounded border cursor-pointer border-slate-300"
            />
            <Button type="primary" onClick={addColor}>
              Xác nhận
            </Button>
            <Button
              onClick={() =>
                setUiState((p) => ({ ...p, showCustomColor: false }))
              }
            >
              Hủy
            </Button>
          </div>
        )}
      </div>

      {matrixData.colors.length > 0 && (
        <div className="p-4 border rounded-xl border-slate-200 bg-slate-50/30">
          <div className="space-y-5!">
            {matrixData.colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div className="flex gap-2 items-center min-w-40">
                  <span
                    className="w-3 h-3 rounded-full border shrink-0 border-slate-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    {color.name}
                  </span>
                </div>

                <div className="pl-0 sm:pl-5 space-y-2!">
                  <Upload
                    multiple
                    listType="picture-card"
                    accept="image/*"
                    fileList={matrixData.galleryFiles[color.name] ?? []}
                    beforeUpload={() => false}
                    onChange={({ fileList }) =>
                      handleUploadChange(color.name, fileList)
                    }
                  >
                    + Tải lên
                  </Upload>

                  <div className="flex flex-wrap gap-2 items-end max-w-2xl">
                    <Input
                      className="flex-1 min-w-50"
                      placeholder="Thêm ảnh bằng URL…"
                      value={matrixData.urlDrafts[color.name] ?? ''}
                      onChange={(e) =>
                        setMatrixData((prev) => ({
                          ...prev,
                          urlDrafts: {
                            ...prev.urlDrafts,
                            [color.name]: e.target.value
                          }
                        }))
                      }
                      onPressEnter={() => appendColorUrl(color.name)}
                    />
                    <Button onClick={() => appendColorUrl(color.name)}>
                      Thêm URL
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAccessories && (
        <div className="p-4 border rounded-xl border-slate-200 bg-slate-50/30">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Kích thước
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {(productType === CategoryType.SHOES
              ? DEFAULT_SHOE_SIZES
              : DEFAULT_SIZES
            ).map((size) => (
              <CheckableTag
                key={size}
                checked={matrixData.sizes.includes(size)}
                onChange={() => toggleSize(size)}
                className="px-4 py-1 text-sm font-medium bg-white rounded-md border transition-all border-slate-200! hover:border-blue-400"
              >
                {size}
              </CheckableTag>
            ))}

            {customSizes.map((size) => (
              <Tag
                key={size}
                closable
                onClose={() => toggleSize(size)}
                className="py-1 px-4 text-sm font-medium text-blue-700 bg-blue-50 rounded-md border-blue-200"
              >
                {size}
              </Tag>
            ))}

            <Button
              type="default"
              size="small"
              variant="outlined"
              danger
              icon={<PlusOutlined />}
              onClick={() =>
                setUiState((p) => ({ ...p, showCustomSize: true }))
              }
              className="rounded-md"
            >
              Thêm
            </Button>
          </div>

          {uiState.showCustomSize && (
            <div className="flex gap-2 items-center p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <Input
                placeholder="Size mới (VD: XL)"
                value={formInputs.newSize}
                onChange={(e) =>
                  setFormInputs((p) => ({ ...p, newSize: e.target.value }))
                }
                onPressEnter={addSize}
                className="max-w-37.5"
              />
              <Button type="primary" onClick={addSize}>
                Xác nhận
              </Button>
              <Button
                onClick={() =>
                  setUiState((p) => ({ ...p, showCustomSize: false }))
                }
              >
                Hủy
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="p-3 rounded-md border border-slate-200">
        <div className="flex gap-2 items-center mb-2">
          <span className="text-sm font-semibold text-slate-600">
            Cấp số lượng tất cả:
          </span>
          <InputNumber
            min={0}
            value={formInputs.bulkQuantity}
            onChange={(value) =>
              setFormInputs((p) => ({ ...p, bulkQuantity: Number(value) || 0 }))
            }
            className="w-16!"
          />
          <Button onClick={applyBulkQuantity}>Áp dụng</Button>
        </div>

        {isAccessories
          ? matrixData.colors.length > 0 && (
              <div className="space-y-3">
                {matrixData.colors.map((color) => {
                  const key = variantKey(color.name, '')
                  return (
                    <div key={color.name} className="flex items-center gap-3">
                      <div className="inline-flex gap-2 items-center min-w-28">
                        <span
                          className="w-3 h-3 rounded-full border shrink-0 border-slate-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </div>
                      <InputNumber
                        min={0}
                        value={matrixData.quantities[key] ?? 0}
                        onChange={(value) =>
                          setMatrixData((prev) => ({
                            ...prev,
                            quantities: {
                              ...prev.quantities,
                              [key]: Number(value) || 0
                            }
                          }))
                        }
                        className="w-16!"
                      />
                    </div>
                  )
                })}
              </div>
            )
          : matrixData.colors.length > 0 &&
            matrixData.sizes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left border-b border-slate-200">
                        Màu sắc
                      </th>
                      {matrixData.sizes.map((size) => (
                        <th
                          key={size}
                          className="p-2 text-left border-b border-slate-200"
                        >
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.colors.map((color) => (
                      <tr key={color.name}>
                        <td className="p-2 border-b border-slate-100">
                          <div className="inline-flex gap-2 items-center">
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </div>
                        </td>
                        {matrixData.sizes.map((size) => {
                          const key = variantKey(color.name, size)
                          return (
                            <td
                              key={key}
                              className="p-2 border-b border-slate-100"
                            >
                              <InputNumber
                                min={0}
                                value={matrixData.quantities[key] ?? 0}
                                onChange={(value) =>
                                  setMatrixData((prev) => ({
                                    ...prev,
                                    quantities: {
                                      ...prev.quantities,
                                      [key]: Number(value) || 0
                                    }
                                  }))
                                }
                                className="w-16!"
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  )
})
