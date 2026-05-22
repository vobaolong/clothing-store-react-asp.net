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
    <aside className='relative z-10 isolate min-w-0 lg:sticky lg:top-0 lg:self-start'>
      <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
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
                  className='h-auto w-full aspect-square object-cover'
                />
              ) : (
                <div className='flex h-56 items-center justify-center text-sm text-slate-500'>
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
                className='h-auto w-full aspect-square object-cover'
              />
            ) : (
              <div className='flex h-56 items-center justify-center text-sm text-slate-500'>
                Chưa có hình ảnh sản phẩm
              </div>
            )}
          </div>
        )}
        <div className='mt-4 space-y-2'>
          <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
            {selectedCategoryName}
          </p>
          <p className='line-clamp-2 text-lg font-semibold text-slate-900'>
            {previewName}
          </p>
        </div>
        <div className='mt-2 flex flex-wrap gap-2'>
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
        <div className='mt-4 rounded-lg bg-slate-50 p-3 flex items-center justify-between'>
          <span className='font-semibold text-slate-900'>
            {previewSalePriceFormatted}
          </span>
          <span className='font-semibold text-xs text-slate-400 line-through'>
            {previewPrice}
          </span>
        </div>
      </div>
    </aside>
  )
}
