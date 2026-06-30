import type { ColumnType } from 'antd/es/table'
import type { Category, DescriptionLayout, Product } from '@/types/product.type'
import { formatDescriptionSpecDisplayValue } from '@/constants/product.constant'
import { MeasurementProfile, CategoryType } from '@/enums'
import {
  getMeasurementPresetRows,
  normalizeMeasurementGender,
  type MeasurementPresetRow
} from '@/constants/measurement-presets.constant'

const BOTTOMS_CATEGORY_PATTERN = /quần|váy|đầm|dress/i

export function parseDescriptionLayout(raw?: string | null): DescriptionLayout | null {
  if (!raw?.trim()) return null
  try {
    return JSON.parse(raw) as DescriptionLayout
  } catch {
    return null
  }
}

export function resolveSizeGuideProfile(
  product: Product | undefined,
  category: Category | undefined
): MeasurementProfile {
  const categoryText = `${product?.categoryName ?? ''} ${category?.name ?? ''}`

  if (category?.productType === CategoryType.SHOES) {
    return MeasurementProfile.SHOES
  }

  if (
    category?.productType === CategoryType.CLOTHING &&
    BOTTOMS_CATEGORY_PATTERN.test(categoryText)
  ) {
    return MeasurementProfile.BOTTOMS
  }

  return MeasurementProfile.TOPS
}

export function buildSizeGuideColumns(
  profile: MeasurementProfile
): ColumnType<MeasurementPresetRow>[] {
  if (profile === MeasurementProfile.SHOES) {
    return [
      { title: 'Size', dataIndex: 'size', key: 'size', align: 'center' },
      { title: 'Độ dài (cm)', dataIndex: 'footLength', key: 'footLength', align: 'center' }
    ]
  }

  if (profile === MeasurementProfile.BOTTOMS) {
    return [
      { title: 'Size', dataIndex: 'size', key: 'size', align: 'center' },
      { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height', align: 'center' },
      { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight', align: 'center' },
      { title: 'Vòng eo (cm)', dataIndex: 'waist', key: 'waist', align: 'center' }
    ]
  }

  return [
    { title: 'Size', dataIndex: 'size', key: 'size', align: 'center' },
    { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height', align: 'center' },
    { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight', align: 'center' },
    { title: 'Vòng ngực (cm)', dataIndex: 'chest', key: 'chest', align: 'center' }
  ]
}

export function buildProductDetails(
  product: Product,
  descriptionLayout: DescriptionLayout | null
): Array<{ label: string; value: string }> {
  if (!descriptionLayout?.specs?.length) {
    return [{ label: 'Mã sản phẩm', value: product.productCode.toUpperCase() }]
  }

  return [
    { label: 'Mã sản phẩm', value: product.productCode.toUpperCase() },
    ...descriptionLayout.specs.map((spec) => ({
      label: String(spec.label ?? ''),
      value: formatDescriptionSpecDisplayValue(String(spec.value ?? ''))
    }))
  ]
}

export function buildSizeGuideTableData(
  descriptionLayout: DescriptionLayout | null,
  profile: MeasurementProfile,
  gender: string | null | undefined
): MeasurementPresetRow[] {
  const rows = descriptionLayout?.sizeGuide?.rows
  if (Array.isArray(rows) && rows.length > 0) return rows
  return getMeasurementPresetRows(profile, normalizeMeasurementGender(gender))
}
