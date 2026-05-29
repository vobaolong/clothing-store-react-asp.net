import React from 'react'

export default function OtpInput({
  otp,
  onChange,
  onKeyDown,
  inputRefs,
  disabled
}: {
  otp: string[]
  onChange: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>
  disabled: boolean
}) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          disabled={disabled}
          className="h-12 w-12 rounded-xl border-2 text-center text-xl font-bold outline-none transition-all"
          autoFocus={index === 0}
        />
      ))}
    </div>
  )
}
