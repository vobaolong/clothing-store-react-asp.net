export function CheckoutSectionTitle({
  step,
  title
}: {
  step: number
  title: string
}) {
  return (
    <div className="flex items-center mb-5 gap-3">
      <div className="flex items-center justify-center text-xs font-bold text-white dark:text-white bg-[#990021] rounded-full h-7 w-7 shrink-0">
        {step}
      </div>
      <h2 className="text-base font-semibold text-slate-800 dark:text-white">
        {title}
      </h2>
    </div>
  )
}
