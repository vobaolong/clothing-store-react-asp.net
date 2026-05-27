import type { ReactNode } from 'react'

type AdminTableHeaderProps = {
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export default function AdminTableHeader({
  left,
  right,
  className = ''
}: AdminTableHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${className}`}
    >
      {left}
      <div className='flex flex-wrap gap-2 justify-end'>{right}</div>
    </div>
  )
}
