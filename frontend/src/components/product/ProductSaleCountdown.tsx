import { Statistic } from 'antd'

const { Timer } = Statistic

interface ProductSaleCountdownProps {
  saleEndDate: number | null
  saleStatisticCountdownFormat: string
  refreshSaleTimer: () => void
}

export default function ProductSaleCountdown({
  saleEndDate,
  saleStatisticCountdownFormat,
  refreshSaleTimer
}: ProductSaleCountdownProps) {
  if (!saleEndDate) return null

  return (
    <div className="flex flex-col items-center flex-1 p-2 bg-red-100 rounded-2xl min-w-40 shrink-0">
      <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
        Kết thúc sau
      </span>
      <Timer
        key={saleStatisticCountdownFormat}
        type="countdown"
        value={saleEndDate}
        format={saleStatisticCountdownFormat}
        onFinish={refreshSaleTimer}
        classNames={{
          root: '!m-0 !p-0 leading-tight',
          content: '!text-xl !font-semibold tabular-nums text-rose-600'
        }}
      />
    </div>
  )
}
