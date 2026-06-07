import {
  TruckOutlined,
  SwapRightOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons'
import ScrollReveal from '@/components/animations/ScrollReveal'

const badges = [
  {
    icon: TruckOutlined,
    title: 'Miễn phí vận chuyển',
    desc: 'Đơn hàng từ 499k'
  },
  {
    icon: SwapRightOutlined,
    title: 'Đổi trả dễ dàng',
    desc: 'Trong vòng 30 ngày'
  },
  {
    icon: SafetyCertificateOutlined,
    title: 'Thanh toán an toàn',
    desc: 'Bảo mật tuyệt đối'
  },
  {
    icon: CustomerServiceOutlined,
    title: 'Hỗ trợ 24/7',
    desc: 'Chăm sóc tận tâm'
  }
]

export default function TrustBadges() {
  return (
    <ScrollReveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-3 items-center p-6 text-center rounded-2xl shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card"
          >
            <div className="flex justify-center items-center w-14 h-14 text-xl text-red-800 bg-red-50 rounded-full transition-all duration-300">
              <Icon className="text-2xl!" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                {title}
              </h4>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  )
}
