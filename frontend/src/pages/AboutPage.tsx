import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-4xl border border-[#0F1E3C]/10 bg-white p-5 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483]">
            Về Wearly
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#0F1E3C] sm:text-4xl md:text-5xl">
            Thương hiệu thời trang B2B tạo khác biệt cho doanh nghiệp của bạn
          </h1>
          <p className="mt-6 text-base leading-8 text-[#0F1E3C]/80 sm:text-lg">
            Wearly cung cấp giải pháp phân phối quần áo chuyên nghiệp với nguồn
            hàng được chọn lọc kỹ lưỡng, hỗ trợ vận hành linh hoạt và dịch vụ
            khách hàng tận tâm. Chúng tôi giúp doanh nghiệp xây dựng bộ sưu tập
            mới mẻ, phù hợp xu thế và tăng trưởng bền vững.
          </p>
          <div className="flex flex-col gap-3 mt-8 sm:flex-row sm:items-center">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#234483] px-6 text-sm font-semibold text-[#FAF9F6] transition hover:bg-[#2E5299]"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <article className="rounded-4xl border border-[#0F1E3C]/10 bg-white p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483]">
            Sứ mệnh
          </p>
          <h2 className="mt-4 text-xl font-semibold text-[#0F1E3C] sm:text-2xl">
            Kết nối thời trang và doanh nghiệp
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#0F1E3C]/75">
            Mang đến lựa chọn quần áo chất lượng cao cho các cửa hàng, thương
            nhân và thương hiệu, với dịch vụ giao nhận nhanh và quy trình đặt
            hàng minh bạch.
          </p>
        </article>

        <article className="rounded-4xl border border-[#0F1E3C]/10 bg-white p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483]">
            Giá trị
          </p>
          <h2 className="mt-4 text-xl font-semibold text-[#0F1E3C] sm:text-2xl">
            Chất lượng, tin cậy và hợp tác lâu dài
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#0F1E3C]/75">
            Mỗi đơn hàng là cam kết về giá trị và trải nghiệm, từ tư vấn phong
            cách đến hỗ trợ vận hành, nhằm giúp đối tác phát triển hiệu quả.
          </p>
        </article>

        <article className="rounded-4xl border border-[#0F1E3C]/10 bg-white p-5 sm:col-span-2 sm:p-8 lg:col-span-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483]">
            Dịch vụ
          </p>
          <h2 className="mt-4 text-xl font-semibold text-[#0F1E3C] sm:text-2xl">
            Hỗ trợ đa dạng cho chuỗi cung ứng
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#0F1E3C]/75">
            Từ lựa chọn sản phẩm theo xu hướng đến quản lý đơn hàng và giao
            nhận, chúng tôi cung cấp giải pháp toàn diện cho mọi quy mô kinh
            doanh.
          </p>
        </article>
      </section>
    </div>
  )
}
