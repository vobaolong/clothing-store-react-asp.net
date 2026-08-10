import {
  TruckOutlined,
  SwapRightOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import ScrollReveal from '@/components/animations/ScrollReveal'

const badges = [
  {
    icon: TruckOutlined,
    titleKey: 'features.trustFreeShip',
    descKey: 'features.trustFreeShipDesc'
  },
  {
    icon: SwapRightOutlined,
    titleKey: 'features.trustEasyReturn',
    descKey: 'features.trustEasyReturnDesc'
  },
  {
    icon: SafetyCertificateOutlined,
    titleKey: 'features.securePayment',
    descKey: 'features.securePaymentDesc'
  },
  {
    icon: CustomerServiceOutlined,
    titleKey: 'features.support247',
    descKey: 'features.support247Desc'
  }
] as const

export default function TrustBadges() {
  const { t } = useTranslation()

  return (
    <ScrollReveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map(({ icon: Icon, titleKey, descKey }) => (
          <div
            key={titleKey}
            className="flex flex-col items-center p-6 text-center gap-3 rounded-2xl shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card"
          >
            <div className="flex items-center justify-center text-xl text-red-800 rounded-full w-14 h-14 bg-red-50 transition-all duration-300">
              <Icon className="text-2xl!" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                {t(titleKey)}
              </h4>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t(descKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  )
}
