type CheckoutSectionTitleProps = {
	step: number
	title: string
}

export function CheckoutSectionTitle({ step, title }: CheckoutSectionTitleProps) {
	return (
		<div className='mb-5 flex items-center gap-3'>
			<div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-900 text-xs font-bold text-white'>
				{step}
			</div>
			<h2 className='text-base font-semibold text-slate-800'>{title}</h2>
		</div>
	)
}
