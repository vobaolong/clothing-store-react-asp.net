import type { ColumnsType } from 'antd/es/table'
import bottomsPreset from '@/data/measurement-presets/bottoms.json'
import topsPreset from '@/data/measurement-presets/tops.json'

export type MeasurementProfile = 'tops' | 'bottoms'

export type TopsMeasurementRow = {
  size: string
  height: string
  weight: string
  chest: string
}

export type BottomsMeasurementRow = {
  size: string
  height: string
  weight: string
  waist: string
}

type PresetConfig<T extends object> = {
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
  tops: PresetConfig<TopsMeasurementRow>
  bottoms: PresetConfig<BottomsMeasurementRow>
}

export const MEASUREMENT_PRESETS = {
  tops: {
    label: 'Thông số áo',
    data: topsPreset as TopsMeasurementRow[],
    columns: [
      { title: 'Size', dataIndex: 'size', key: 'size' },
      { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
      { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
      { title: 'Vòng ngực (cm)', dataIndex: 'chest', key: 'chest' }
    ] as ColumnsType<TopsMeasurementRow>
  },
  bottoms: {
    label: 'Thông số quần',
    data: bottomsPreset as BottomsMeasurementRow[],
    columns: [
      { title: 'Size', dataIndex: 'size', key: 'size' },
      { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
      { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
      { title: 'Vòng eo (cm)', dataIndex: 'waist', key: 'waist' }
    ] as ColumnsType<BottomsMeasurementRow>
  }
} satisfies MeasurementPresetMap
