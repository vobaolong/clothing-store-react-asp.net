import {
  FreeShipIcon,
  ReturnIcon,
  PhoneIcon,
  LocationIcon
} from '@/components/icons'

const FEATURES = [
  { id: 'freeship', icon: FreeShipIcon, sub: 'Free ship cho đơn từ 499k' },
  { id: 'return', icon: ReturnIcon, sub: '60 ngày đổi trả vì bất kỳ lý do gì' },
  {
    id: 'phone',
    icon: PhoneIcon,
    sub: 'Hotline 1900272737\nhỗ trợ từ 8h30 - 22h'
  },
  {
    id: 'location',
    icon: LocationIcon,
    sub: 'Đến tận nơi nhận hàng trả,\nhoàn tiền 2-3 ngày (trừ T7, CN)'
  }
] as const

export default function ProductFeatureIcons() {
  return (
    <div className="grid grid-cols-2 mt-4 rounded-lg card">
      {FEATURES.map(({ id, icon: Icon, sub }) => (
        <div key={id} className="flex items-center gap-2 p-4 text-start">
          <Icon className="size-6 shrink-0" />
          <p className="m-0! whitespace-pre-line text-xs text-stone-700 dark:text-stone-300">
            {sub}
          </p>
        </div>
      ))}
    </div>
  )
}
