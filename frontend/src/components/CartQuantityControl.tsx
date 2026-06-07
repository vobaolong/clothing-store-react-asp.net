import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, InputNumber } from 'antd'

type CartQuantityControlProps = {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  showButtons?: boolean
}

export default function CartQuantityControl({
  value,
  min = 1,
  max,
  onChange,
  showButtons = true
}: CartQuantityControlProps) {
  const canDecrease = value > min
  const canIncrease = typeof max === 'number' ? value < max : true

  return (
    <div className="inline-flex items-center overflow-hidden border rounded-lg w-fit border-slate-300">
      {showButtons && (
        <Button
          type="text"
          icon={<MinusOutlined />}
          className="rounded-none!"
          disabled={!canDecrease}
          onClick={() => onChange(value - 1)}
        />
      )}
      <InputNumber
        controls={false}
        min={min}
        max={max}
        value={value}
        className="cart-qty-input w-10! h-8 border-x border-y-0! border-slate-300! rounded-none! card"
        style={{ width: 44 }}
        onChange={(nextValue) => {
          const next = Number(nextValue)
          if (!Number.isFinite(next)) return
          onChange(next)
        }}
      />
      {showButtons && (
        <Button
          type="text"
          icon={<PlusOutlined />}
          className="rounded-none!"
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
        />
      )}
    </div>
  )
}
