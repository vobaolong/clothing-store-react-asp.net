import { Form } from 'antd'
import type { FormInstance } from 'antd'

type BannerPreviewPanelProps = {
	form: FormInstance
}

export default function BannerPreviewPanel({ form }: BannerPreviewPanelProps) {
	const imageUrl = Form.useWatch('imageUrl', form) as string | undefined
	const cleanImageUrl = String(imageUrl ?? '').trim()

	return (
		<div className="relative w-full h-48 overflow-hidden rounded-lg card">
			{cleanImageUrl ? (
				<img
					src={cleanImageUrl}
					alt="Banner preview"
					className="object-cover w-full h-full"
				/>
			) : (
				<div className="flex items-center justify-center h-full text-sm text-slate-400">
					Xem trước Banner
				</div>
			)}
		</div>
	)
}
