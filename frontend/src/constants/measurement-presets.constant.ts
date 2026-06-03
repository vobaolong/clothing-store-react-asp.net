import type { ColumnsType } from 'antd/es/table'
import bottomsFemalePreset from '@/data/measurement-presets/bottoms-female.json'
import bottomsMalePreset from '@/data/measurement-presets/bottoms-male.json'
import bottomsPreset from '@/data/measurement-presets/bottoms.json'
import shoesPreset from '@/data/measurement-presets/shoes.json'
import topsFemalePreset from '@/data/measurement-presets/tops-female.json'
import topsMalePreset from '@/data/measurement-presets/tops-male.json'
import topsPreset from '@/data/measurement-presets/tops.json'
import { CategoryGender, MeasurementProfile } from '@/enums'

export type MeasurementGender = CategoryGender

export type MeasurementPresetRow = {
  size: string
  height?: string
  weight?: string
  chest?: string
  waist?: string
  footLength?: string
}

type PresetConfig<T extends MeasurementPresetRow> = {
  label: string
  data: T[]
  columns: ColumnsType<T>
}

export const MEASUREMENT_PRESET_OPTIONS: Array<{
  label: string
  value: MeasurementProfile
}> = [
  { label: 'Áo (chiều cao, cân nặng, vòng ngực)', value: MeasurementProfile.TOPS },
  { label: 'Quần (chiều cao, cân nặng, vòng eo)', value: MeasurementProfile.BOTTOMS },
  { label: 'Giày (size, độ dài chân)', value: MeasurementProfile.SHOES }
]

type MeasurementPresetMap = {
  [MeasurementProfile.TOPS]: PresetConfig<MeasurementPresetRow>
  [MeasurementProfile.BOTTOMS]: PresetConfig<MeasurementPresetRow>
  [MeasurementProfile.SHOES]: PresetConfig<MeasurementPresetRow>
}

const TOPS_COLUMNS: ColumnsType<MeasurementPresetRow> = [
  { title: 'Size', dataIndex: 'size', key: 'size' },
  { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
  { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
  { title: 'Vòng ngực (cm)', dataIndex: 'chest', key: 'chest' }
]

const BOTTOMS_COLUMNS: ColumnsType<MeasurementPresetRow> = [
  { title: 'Size', dataIndex: 'size', key: 'size' },
  { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
  { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
  { title: 'Vòng eo (cm)', dataIndex: 'waist', key: 'waist' }
]

const SHOES_COLUMNS: ColumnsType<MeasurementPresetRow> = [
  { title: 'Size', dataIndex: 'size', key: 'size' },
  { title: 'Độ dài (cm)', dataIndex: 'footLength', key: 'footLength' }
]

export const MEASUREMENT_PRESETS = {
  [MeasurementProfile.TOPS]: {
    label: 'Thông số áo',
    data: topsPreset as MeasurementPresetRow[],
    columns: TOPS_COLUMNS
  },
  [MeasurementProfile.BOTTOMS]: {
    label: 'Thông số quần',
    data: bottomsPreset as MeasurementPresetRow[],
    columns: BOTTOMS_COLUMNS
  },
  [MeasurementProfile.SHOES]: {
    label: 'Thông số giày',
    data: shoesPreset as MeasurementPresetRow[],
    columns: SHOES_COLUMNS
  }
} satisfies MeasurementPresetMap

const allGenders = <T>(data: T) => ({
  [CategoryGender.MALE]: data,
  [CategoryGender.FEMALE]: data,
  [CategoryGender.UNISEX]: data
})

const MEASUREMENT_PRESET_DATA = {
  [MeasurementProfile.TOPS]: {
    [CategoryGender.MALE]: topsMalePreset as MeasurementPresetRow[],
    [CategoryGender.FEMALE]: topsFemalePreset as MeasurementPresetRow[],
    [CategoryGender.UNISEX]: topsPreset as MeasurementPresetRow[]
  },
  [MeasurementProfile.BOTTOMS]: {
    [CategoryGender.MALE]: bottomsMalePreset as MeasurementPresetRow[],
    [CategoryGender.FEMALE]: bottomsFemalePreset as MeasurementPresetRow[],
    [CategoryGender.UNISEX]: bottomsPreset as MeasurementPresetRow[]
  },
  [MeasurementProfile.SHOES]: allGenders(shoesPreset as MeasurementPresetRow[])
} as const

export function normalizeMeasurementGender(
  gender?: string | null
): MeasurementGender {
  const values = Object.values(CategoryGender) as MeasurementGender[]
  return values.find((v) => v === gender) ?? CategoryGender.UNISEX
}

export function getMeasurementPresetRows(
  profile: MeasurementProfile,
  gender: MeasurementGender = CategoryGender.UNISEX
): MeasurementPresetRow[] {
  return MEASUREMENT_PRESET_DATA[profile][gender]
}

export function getMeasurementPresetLabel(
  profile: MeasurementProfile,
  gender: MeasurementGender = CategoryGender.UNISEX
): string {
  if (profile === MeasurementProfile.SHOES) return 'Thông số giày'
  const base = profile === MeasurementProfile.TOPS ? 'Thông số áo' : 'Thông số quần'
  if (gender === CategoryGender.MALE) return `${base} - Nam`
  if (gender === CategoryGender.FEMALE) return `${base} - Nữ`
  return base
}
