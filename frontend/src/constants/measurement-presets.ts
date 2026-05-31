import type { ColumnsType } from 'antd/es/table'
import bottomsFemalePreset from '@/data/measurement-presets/bottoms-female.json'
import bottomsMalePreset from '@/data/measurement-presets/bottoms-male.json'
import bottomsPreset from '@/data/measurement-presets/bottoms.json'
import shoesPreset from '@/data/measurement-presets/shoes.json'
import topsFemalePreset from '@/data/measurement-presets/tops-female.json'
import topsMalePreset from '@/data/measurement-presets/tops-male.json'
import topsPreset from '@/data/measurement-presets/tops.json'

export type MeasurementProfile = 'tops' | 'bottoms' | 'shoes'
export type MeasurementGender = 'male' | 'female' | 'unisex'

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
  { label: 'Áo (chiều cao, cân nặng, vòng ngực)', value: 'tops' },
  { label: 'Quần (chiều cao, cân nặng, vòng eo)', value: 'bottoms' }
]

type MeasurementPresetMap = {
  tops: PresetConfig<MeasurementPresetRow>
  bottoms: PresetConfig<MeasurementPresetRow>
  shoes: PresetConfig<MeasurementPresetRow>
}

const TOPS_COLUMNS = [
  { title: 'Size', dataIndex: 'size', key: 'size' },
  { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
  { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
  { title: 'Vòng ngực (cm)', dataIndex: 'chest', key: 'chest' }
] as ColumnsType<MeasurementPresetRow>

const BOTTOMS_COLUMNS = [
  { title: 'Size', dataIndex: 'size', key: 'size' },
  { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
  { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
  { title: 'Vòng eo (cm)', dataIndex: 'waist', key: 'waist' }
] as ColumnsType<MeasurementPresetRow>

const SHOES_COLUMNS = [
  { title: 'Size', dataIndex: 'size', key: 'size' },
  { title: 'Độ dài (cm)', dataIndex: 'footLength', key: 'footLength' }
] as ColumnsType<MeasurementPresetRow>

export const MEASUREMENT_PRESETS = {
  tops: {
    label: 'Thông số áo',
    data: topsPreset as MeasurementPresetRow[],
    columns: TOPS_COLUMNS
  },
  bottoms: {
    label: 'Thông số quần',
    data: bottomsPreset as MeasurementPresetRow[],
    columns: BOTTOMS_COLUMNS
  },
  shoes: {
    label: 'Thông số giày',
    data: shoesPreset as MeasurementPresetRow[],
    columns: SHOES_COLUMNS
  }
} satisfies MeasurementPresetMap

const MEASUREMENT_PRESET_DATA = {
  tops: {
    male: topsMalePreset as MeasurementPresetRow[],
    female: topsFemalePreset as MeasurementPresetRow[],
    unisex: topsPreset as MeasurementPresetRow[]
  },
  bottoms: {
    male: bottomsMalePreset as MeasurementPresetRow[],
    female: bottomsFemalePreset as MeasurementPresetRow[],
    unisex: bottomsPreset as MeasurementPresetRow[]
  },
  shoes: {
    male: shoesPreset as MeasurementPresetRow[],
    female: shoesPreset as MeasurementPresetRow[],
    unisex: shoesPreset as MeasurementPresetRow[]
  }
} as const

export function normalizeMeasurementGender(
  gender?: string | null
): MeasurementGender {
  const value = gender?.toLowerCase()
  if (value === 'male' || value === 'female' || value === 'unisex') {
    return value
  }
  return 'unisex'
}

export function getMeasurementPresetRows(
  profile: MeasurementProfile,
  gender: MeasurementGender = 'unisex'
): MeasurementPresetRow[] {
  return MEASUREMENT_PRESET_DATA[profile][gender]
}

export function getMeasurementPresetLabel(
  profile: MeasurementProfile,
  gender: MeasurementGender = 'unisex'
): string {
  const base = profile === 'tops' ? 'Thông số áo' : 'Thông số quần'
  if (gender === 'male') return `${base} - Nam`
  if (gender === 'female') return `${base} - Nữ`
  return base
}
