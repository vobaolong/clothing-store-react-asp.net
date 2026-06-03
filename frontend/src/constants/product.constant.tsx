import type { ColumnsType } from 'antd/es/table'
import type { SizeGuideItem } from '@/types/product.type'
import { getProductSizes, getProductShoeSizes } from '@/utils/enum.utils'

export const SIZE_GUIDE: SizeGuideItem[] = [
  {
    size: 'S',
    weight: '48-55',
    height: '155-160',
    length: '41.5',
    waist: '32',
    hip: '49',
    thigh: '32.5',
    leg: '29'
  },
  {
    size: 'M',
    weight: '55-62',
    height: '160-165',
    length: '42.5',
    waist: '34',
    hip: '51',
    thigh: '33.5',
    leg: '30'
  },
  {
    size: 'L',
    weight: '62-69',
    height: '165-172',
    length: '43.5',
    waist: '36',
    hip: '53',
    thigh: '34.5',
    leg: '31'
  },
  {
    size: 'XL',
    weight: '69-76',
    height: '172-177',
    length: '44.5',
    waist: '38',
    hip: '55',
    thigh: '35.5',
    leg: '32'
  },
  {
    size: '2XL',
    weight: '76-85',
    height: '177-183',
    length: '45',
    waist: '40',
    hip: '57',
    thigh: '36',
    leg: '33'
  },
  {
    size: '3XL',
    weight: '85-90',
    height: '183-189',
    length: '46.5',
    waist: '42',
    hip: '59',
    thigh: '37.5',
    leg: '34'
  }
]

export const SIZE_COLUMNS: ColumnsType<SizeGuideItem> = [
  {
    title: 'Size',
    dataIndex: 'size',
    key: 'size',
    render: (t: string) => <span className="font-bold text-black">{t}</span>
  },
  { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
  { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
  { title: 'Dài quần', dataIndex: 'length', key: 'length' },
  { title: '1/2 ngang lưng', dataIndex: 'waist', key: 'waist' },
  { title: 'Ngang mông', dataIndex: 'hip', key: 'hip' },
  { title: 'Ngang đùi', dataIndex: 'thigh', key: 'thigh' },
  { title: 'Ngang ống', dataIndex: 'leg', key: 'leg' }
]
export const COLOR_CONFIG: Record<string, { color: string; border?: boolean }> =
  {
    'Phối màu': {
      color: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
    },
    Trắng: { color: '#ffffff', border: true }
  }

export const DEFAULT_SIZES = getProductSizes()
export const DEFAULT_SHOE_SIZES = getProductShoeSizes()

export const DESCRIPTION_SPEC_LABELS = [
  'Đặc điểm',
  'Chất liệu',
  'Kiểu dáng',
  'Phù hợp',
  'Tính năng',
  'Bảo quản'
] as const

export type DescriptionSpecLabel = (typeof DESCRIPTION_SPEC_LABELS)[number]

export const DESCRIPTION_SPEC_VALUE_JOINER = '\n'

export function parseDescriptionSpecStoredValue(raw: string): string[] {
  const t = raw.trim()
  if (!t) return []
  return t
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatDescriptionSpecDisplayValue(raw: string): string {
  return parseDescriptionSpecStoredValue(raw).join('\n')
}

export function serializeDescriptionSpecValues(selected: string[]): string {
  return selected
    .map((s) => s.trim())
    .filter(Boolean)
    .join(DESCRIPTION_SPEC_VALUE_JOINER)
}

export const DESCRIPTION_SPEC_OPTIONS: Record<
  DescriptionSpecLabel,
  readonly string[]
> = {
  'Đặc điểm': [
    'Form chuẩn dễ mặc',
    'Đường may chắc chắn',
    'Vải mềm mại',
    'Thoáng mát',
    'Ít nhăn',
    'Ít xù lông',
    'Giữ form tốt',
    'Màu sắc bền đẹp',
    'Dễ phối đồ'
  ],
  'Chất liệu': [
    'Cotton',
    'Cotton pha',
    'Polyester',
    'Polyester pha',
    'Spandex / Elastane',
    'Denim',
    'Kaki',
    'Linen',
    'Nỉ',
    'Thun',
    'Len',
    'Da PU',
    'Voan',
    'Lụa',
    'Dạ'
  ],
  'Kiểu dáng': [
    'Regular fit',
    'Slim fit',
    'Relaxed fit',
    'Oversized',
    'Dáng suông',
    'Dáng ôm nhẹ',
    'Tay ngắn',
    'Tay dài',
    'Không tay',
    'Cổ tròn',
    'Cổ bẻ',
    'Cổ tim',
    'Có mũ',
    'Quần short',
    'Quần dài',
    'Ống đứng',
    'Ống suông',
    'Ống rộng',
    'Chân váy',
    'Đầm liền'
  ],
  'Phù hợp': [
    'Đi học',
    'Đi làm',
    'Đi chơi',
    'Dạo phố',
    'Ở nhà',
    'Du lịch',
    'Đi tiệc nhẹ',
    'Mặc hằng ngày',
    'Mặc đôi / nhóm',
    'Phối layer'
  ],
  'Tính năng': [
    'Dễ phối đồ',
    'Mặc thoải mái',
    'Chất vải mềm',
    'Thoáng mát',
    'Co giãn nhẹ',
    'Có túi',
    'Túi có khóa',
    'Lưng thun',
    'Dây rút điều chỉnh',
    'Không kén dáng',
    'Che khuyết điểm tốt',
    'Phù hợp nhiều hoàn cảnh'
  ],
  'Bảo quản': [
    'Giặt máy chế độ nhẹ',
    'Giặt tay',
    'Giặt với màu tương tự',
    'Không dùng chất tẩy mạnh',
    'Không ngâm quá lâu',
    'Phơi nơi thoáng mát',
    'Phơi mặt trái sản phẩm',
    'Ủi nhiệt thấp',
    'Không ủi trực tiếp lên hình in / thêu',
    'Không sấy nhiệt cao'
  ]
}

export const DEFAULT_COLORS = [
  { name: 'Đen', hex: '#000000' },
  { name: 'Trắng', hex: '#ffffff' },
  { name: 'Xanh navy', hex: '#000080' },
  { name: 'Xám', hex: '#808080' },
  { name: 'Đỏ', hex: '#ff0000' },
  { name: 'Xanh lá', hex: '#008000' },
  { name: 'Vàng', hex: '#ffff00' },
  { name: 'Hồng', hex: '#ffc0cb' }
]
