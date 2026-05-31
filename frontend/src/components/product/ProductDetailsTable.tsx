interface ProductDetailsTableProps {
  productDetails: { label: string; value: string }[]
}

export default function ProductDetailsTable({
  productDetails
}: ProductDetailsTableProps) {
  if (productDetails.length === 0) return null

  return (
    <div className="p-6 bg-white border rounded-lg border-slate-200">
      <p className="mb-4 text-base font-semibold text-black">
        Thông số kỹ thuật
      </p>
      <dl className="divide-y divide-stone-100">
        {productDetails.map(({ label, value }, idx) => (
          <div
            key={`${label}-${idx}`}
            className="flex items-start justify-between gap-4 py-3"
          >
            <dt className="text-xs! uppercase text-stone-600 shrink-0">
              {label}
            </dt>
            <dd className="text-sm font-medium text-stone-700 text-right max-w-[65%]">
              {label === 'SKU'
                ? value
                : value.split('\n').map((line, lineIdx) => (
                    <span
                      key={`${idx}-${lineIdx}`}
                      className="block leading-relaxed"
                    >
                      {line}
                    </span>
                  ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
