import { Badge } from 'antd'

type AdminProductPreviewCardProps = {
  discountPercent: number
  previewImageUrl: string | undefined
  previewName: string
  selectedCategoryName: string
  previewColors: Array<{ color: string; hex: string }>
  previewSalePriceFormatted: string
  previewPrice: string
}

export default function AdminProductPreviewCard({
  discountPercent,
  previewImageUrl,
  previewName,
  selectedCategoryName,
  previewColors,
  previewSalePriceFormatted,
  previewPrice
}: AdminProductPreviewCardProps) {
  return (
    <aside className='relative z-10 min-w-0 isolate lg:sticky lg:top-0 lg:self-start'>
      <div className='p-4 bg-white rounded-2xl border shadow-sm border-slate-200'>
        {discountPercent > 0 ? (
          <Badge.Ribbon
            text={`-${discountPercent}%`}
            color='red'
            placement='end'
          >
            <div className='overflow-hidden rounded-xl border border-slate-200 bg-slate-100'>
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt={previewName}
                  className='object-cover w-full h-auto aspect-square'
                />
              ) : (
                <div className='flex justify-center items-center h-56 text-sm text-slate-500'>
                  Chưa có hình ảnh sản phẩm
                </div>
              )}
            </div>
          </Badge.Ribbon>
        ) : (
          <div className='overflow-hidden rounded-xl border border-slate-200 bg-slate-100'>
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={previewName}
                className='object-cover w-full h-auto aspect-square'
              />
            ) : (
              <div className='flex justify-center items-center h-56 text-sm text-slate-500'>
                Chưa có hình ảnh sản phẩm
              </div>
            )}
          </div>
        )}
        <div className='mt-4 space-y-2'>
          <p className='text-xs font-medium tracking-wide uppercase text-slate-500'>
            {selectedCategoryName}
          </p>
          <p className='text-lg font-semibold line-clamp-2 text-slate-900'>
            {previewName}
          </p>
        </div>
        <div className='flex flex-wrap gap-2 mt-2'>
          {previewColors.length ? (
            previewColors.map((item) => (
              <div
                key={`${item.color}-${item.hex}`}
                style={{ backgroundColor: item.hex }}
                className='flex items-center gap-1.5 w-10 h-6 rounded-full border border-slate-200 px-2 py-1'
              ></div>
            ))
          ) : (
            <span className='text-xs text-slate-500'>Không có màu</span>
          )}
        </div>
        <div className='flex justify-between items-center p-3 mt-4 rounded-lg bg-slate-50'>
          <span className='font-semibold text-slate-900'>
            {previewSalePriceFormatted}
          </span>
          <span className='text-xs font-semibold line-through text-slate-400'>
            {previewPrice}
          </span>
        </div>
      </div>
    </aside>
  )
}
