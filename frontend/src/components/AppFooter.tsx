import {
  FacebookFilled,
  InstagramFilled,
  YoutubeFilled,
  PhoneFilled,
  MailFilled
} from '@ant-design/icons'
import type { ComponentType } from 'react'
import { Button } from 'antd'

type ContactItem = {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
}

type FooterLinkGroup = {
  title: string
  links: string[]
}

type FooterColumn = {
  groups: FooterLinkGroup[]
}

type ContactAddress = {
  label: string
  value: string
}

const contactItems: ContactItem[] = [
  {
    label: 'Hotline',
    value: '0123456789 - 0123456789',
    icon: PhoneFilled
  },
  {
    label: 'Email',
    value: 'support@wearly.com',
    icon: MailFilled
  }
]

const socialIcons = [FacebookFilled, InstagramFilled, YoutubeFilled]

const footerColumns: FooterColumn[] = [
  {
    groups: [
      {
        title: 'WEARCLUB',
        links: [
          'Tải khoản WearClub',
          'Đăng kí thành viên',
          'Ưu đãi & Đặc quyền'
        ]
      },
      {
        title: 'TÀI LIỆU - TUYỂN DỤNG',
        links: ['Tuyển dụng', 'Đăng ký bản quyền']
      }
    ]
  },
  {
    groups: [
      {
        title: 'CHÍNH SÁCH',
        links: [
          'Chính sách đổi trả tại cửa hàng',
          'Chính sách đổi trả 60 ngày online',
          'Chính sách khuyến mãi',
          'Chính sách bảo mật',
          'Chính sách giao hàng'
        ]
      }
    ]
  },
  {
    groups: [
      {
        title: 'CHĂM SÓC KHÁCH HÀNG',
        links: ['Trải nghiệm mua sắm 100% hài lòng', 'Hỏi đáp - FAQs']
      },
      {
        title: 'KIẾN THỨC MẶC ĐẸP',
        links: ['Hướng dẫn chọn size', 'Blog']
      }
    ]
  },
  {
    groups: [
      {
        title: 'VỀ Wearly',
        links: [
          'Quy tắc ứng xử của Wearly',
          'Wearly 101',
          'DVKH xuất sắc',
          'Câu chuyện về Wearly',
          'Nhà máy',
          'Care & Share',
          'Cam kết bền vững',
          'Tầm nhìn 2030'
        ]
      }
    ]
  }
]

const contactAddresses: ContactAddress[] = [
  {
    label: 'Cửa hàng:',
    value: 'B2-34, Tầng B2, Hanoi Centre, 175 Nguyễn Thái Học, Đống Đa, Hà Nội'
  },
  {
    label: 'Văn phòng Hà Nội:',
    value:
      'Tầng 3-4, Tòa nhà BMM, Km2, Đường Phùng Hưng, Phường Hà Đông, Thành phố Hà Nội, Việt Nam'
  }
]

export default function AppFooter() {
  return (
    <footer id="footer" className="text-white bg-black/90 px-4! md:px-8!">
      <div className="py-8 mx-auto w-full max-w-7xl">
        <div className="flex flex-col justify-between gap-12 pb-12 border-b border-stone-800 lg:flex-row">
          <div className="max-w-xl space-y-6">
            <h2 className="font-bold tracking-tight lg:text-3xl md:text-2xl sm:text-xl">
              Wearly lắng nghe bạn!
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng
              góp từ khách hàng để có thể nâng cấp trải nghiệm dịch vụ và sản
              phẩm tốt hơn nữa.
            </p>
            <Button
              type="primary"
              className="font-semibold text-black bg-white border-none rounded-full"
            >
              ĐÓNG GÓP Ý KIẾN &rarr;
            </Button>
          </div>

          <div className="flex flex-col gap-8 md:flex-row lg:gap-16">
            {contactItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex gap-4 items-start">
                <div className="flex justify-center items-center w-12 h-12 rounded-full bg-stone-900">
                  <Icon className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-stone-500">
                    {label}
                  </p>
                  <p className="font-semibold text-md">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 py-12">
          {socialIcons.map((Icon) => (
            <a
              key={Icon.displayName ?? Icon.name}
              href="#"
              className="flex items-center justify-center transition-colors border rounded-lg size-10 border-stone-800 hover:bg-stone-900"
            >
              <span className="text-xl">
                <Icon />
              </span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-5">
          {footerColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.groups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <h3 className="text-sm font-bold tracking-wider uppercase">
                    {group.title}
                  </h3>
                  <ul className="space-y-2 text-sm text-stone-400">
                    {group.links.map((link) => (
                      <li key={link}>
                        <a href="#">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}

          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider uppercase">
              ĐỊA CHỈ LIÊN HỆ
            </h3>
            <ul className="space-y-4 text-[13px] leading-relaxed text-stone-400">
              {contactAddresses.map((item) => (
                <li key={item.label}>
                  <span className="block font-semibold text-white underline">
                    {item.label}
                  </span>
                  {item.value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-16 border-t border-stone-800">
          <p className="text-xs text-center text-stone-500">
            &copy; {new Date().getFullYear()} Wearly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
