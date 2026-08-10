import {
  FreeShipIcon,
  ReturnIcon,
  PhoneIcon,
  LocationIcon
} from '@/components/icons'
import { useTranslation } from 'react-i18next'

const FEATURES = [
  { id: 'freeship', icon: FreeShipIcon, key: 'features.freeShippingDesc' },
  { id: 'return', icon: ReturnIcon, key: 'features.easyReturnDesc' },
  { id: 'phone', icon: PhoneIcon, key: 'features.hotline' },
  { id: 'location', icon: LocationIcon, key: 'features.doorToDoor' }
] as const

export default function ProductFeatureIcons() {
  const { t } = useTranslation()

  return (
    <div className="mt-4 rounded-lg grid grid-cols-2 card">
      {FEATURES.map(({ id, icon: Icon, key }) => (
        <div key={id} className="flex items-center p-4 gap-2 text-start">
          <Icon className="size-6 shrink-0" />
          <p className="m-0! whitespace-pre-line text-xs text-stone-700 dark:text-stone-300">
            {t(key)}
          </p>
        </div>
      ))}
    </div>
  )
}
