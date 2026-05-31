import dayjs from 'dayjs'
import {
  DESCRIPTION_SPEC_LABELS,
  parseDescriptionSpecStoredValue,
  serializeDescriptionSpecValues
} from '@/constants/product'

import type { DescriptionLayout, AdminProduct } from '@/types'
import {
  getMeasurementPresetRows,
  normalizeMeasurementGender,
  type MeasurementGender,
  type MeasurementPresetRow,
  type MeasurementProfile
} from '@/constants/measurement-presets'

const normalizeMeasurementRows = (
  rows: Array<Partial<MeasurementPresetRow>>
): MeasurementPresetRow[] =>
  rows
    .map((row) => ({
      size: row.size?.trim() ?? '',
      height: row.height?.trim(),
      weight: row.weight?.trim(),
      chest: row.chest?.trim(),
      waist: row.waist?.trim(),
      footLength: row.footLength?.trim()
    }))
    .filter((row) => row.size.length > 0)

const DEFAULT_DESCRIPTION_SPECS = DESCRIPTION_SPEC_LABELS.map((label) => ({
  label,
  value: [] as string[]
}))

export const flattenVariantImageUrls = (
  variants: Array<{ imageUrl?: string | null; imageUrls?: string[] | null }>
): string[] => {
  const out: string[] = []
  for (const v of variants) {
    const raw =
      v.imageUrls?.flatMap((u) => {
        const value = String(u).trim()
        return value ? [value] : []
      }) ?? []
    const one = v.imageUrl?.trim()
    const row = raw.length > 0 ? [...new Set(raw)] : one ? [one] : []
    out.push(...row)
  }
  return [...new Set(out)]
}

export const parseDescriptionLayout = (
  raw: string
): DescriptionLayout | null => {
  if (!raw?.trim()) return null
  try {
    return JSON.parse(raw) as DescriptionLayout
  } catch {
    return null
  }
}

export const buildDefaultDescriptionSpecs = (
  specs: Array<{ label?: string; value?: string }> = []
) =>
  DEFAULT_DESCRIPTION_SPECS.map((defaultSpec) => {
    const matchedSpec = specs.find(
      (item) =>
        item.label?.trim().toLowerCase() === defaultSpec.label.toLowerCase()
    )
    return {
      label: defaultSpec.label,
      value: parseDescriptionSpecStoredValue(matchedSpec?.value ?? '')
    }
  })

export const transformProductToFormValues = (editing: AdminProduct) => {
  const parsed = parseDescriptionLayout(editing.descriptionData)
  const measurementProfile: MeasurementProfile = /quần|váy|đầm|dress/i.test(
    editing.categoryName
  )
    ? 'bottoms'
    : 'tops'
  const sizeGuideGender = normalizeMeasurementGender(parsed?.sizeGuide?.gender)
  const sizeGuidePresetProfile =
    parsed?.sizeGuide?.profile === 'bottoms' ||
    parsed?.sizeGuide?.profile === 'tops'
      ? parsed.sizeGuide.profile
      : measurementProfile
  const sizeGuideRows = parsed?.sizeGuide?.rows?.length
    ? normalizeMeasurementRows(parsed.sizeGuide.rows)
    : getMeasurementPresetRows(sizeGuidePresetProfile, sizeGuideGender)
  const variants = (
    Array.isArray(editing.variants) ? editing.variants : []
  ).map((variant) => {
    const fromList =
      variant.imageUrls?.flatMap((u) => {
        const value = u.trim()
        return value ? [value] : []
      }) ?? []
    const one = variant.imageUrl?.trim()
    const gallery =
      fromList.length > 0 ? [...new Set(fromList)] : one ? [one] : []
    return {
      size: variant.size,
      color: variant.color,
      hex: variant.hex,
      quantity: variant.quantity,
      imageUrl: gallery[0] ?? null,
      imageUrls: gallery.length > 0 ? gallery : undefined
    }
  })

  return {
    measurementProfile,
    sizeGuideGender,
    sizeGuidePresetProfile,
    sizeGuideRows,
    isActive: editing.isActive,
    name: editing.name,
    productCode: editing.productCode,
    description: editing.description,
    descriptionSpecs: buildDefaultDescriptionSpecs(parsed?.specs ?? []),
    categoryId: editing.categoryId,
    price: editing.price,
    salePrice: editing.salePrice,
    salePriceStartDate: editing.salePriceStartDate
      ? dayjs(editing.salePriceStartDate)
      : undefined,
    salePriceEndDate: editing.salePriceEndDate
      ? dayjs(editing.salePriceEndDate)
      : undefined,
    variants
  }
}

export const prepareDescriptionData = (
  descriptionSpecs: Array<{ label: string; value: string | string[] }>,
  sizeGuide?: {
    profile?: MeasurementProfile
    gender?: MeasurementGender
    rows?: Array<Partial<MeasurementPresetRow>>
  }
) => {
  const normalizedRows = sizeGuide?.rows
    ? normalizeMeasurementRows(sizeGuide.rows)
    : []
  return JSON.stringify({
    specs: (descriptionSpecs ?? [])
      .map((item: { label?: string; value?: string | string[] }) => ({
        label: item.label?.trim(),
        value: Array.isArray(item.value)
          ? serializeDescriptionSpecValues(item.value)
          : item.value?.trim()
      }))
      .filter(
        (item: { label?: string; value?: string }) =>
          item.label && item.value && item.value.length > 0
      ),
    sizeGuide:
      sizeGuide?.profile && normalizedRows.length > 0
        ? {
            profile: sizeGuide.profile,
            gender: normalizeMeasurementGender(sizeGuide.gender),
            rows: normalizedRows
          }
        : undefined
  })
}
