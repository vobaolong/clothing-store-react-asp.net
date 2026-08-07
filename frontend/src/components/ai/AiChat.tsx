import {
	CloseOutlined,
	CustomerServiceOutlined,
	LoadingOutlined,
	SendOutlined,
	ShoppingOutlined
} from '@ant-design/icons'
import { Button, Card, Input, Rate, Tag, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { aiChat } from '@/api/ai-api'
import { formatCurrency } from '@/utils/format'
import { lp } from '@/utils/language-path'
import type { ChatMessage, ChatResponse } from '@/types'
import { useTranslation } from 'react-i18next'

const { Text, Title } = Typography

const QUICK_ACTIONS = [
	{ label: '🛍️ Tìm áo thun nam', message: 'Tôi muốn tìm áo thun nam' },
	{
		label: '📦 Chính sách đổi trả',
		message: 'Chính sách đổi trả của shop như thế nào?'
	},
	{ label: '🚚 Vận chuyển', message: 'Thời gian vận chuyển bao lâu?' },
	{ label: '❓ Câu hỏi thường gặp', message: 'Câu hỏi thường gặp' },
	{ label: '🎉 Khuyến mãi', message: 'Có khuyến mãi gì không?' },
	{ label: '👕 Tư vấn size', message: 'Tôi cao 1m72 nặng 68kg' }
]

const WELCOME_MESSAGE: ChatMessage = {
	id: 'welcome',
	role: 'assistant',
	content:
		'Xin chào! Tôi là trợ lý thời trang của Wearly. Tôi có thể giúp bạn tìm sản phẩm, tư vấn size, phối đồ, hoặc trả lời các câu hỏi về chính sách. Bạn cần tôi hỗ trợ gì hôm nay?',
	timestamp: new Date()
}

function generateId(): string {
	return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildChatMessage(response: ChatResponse): ChatMessage {
	return {
		id: generateId(),
		role: 'assistant',
		content: response.reply,
		timestamp: new Date(),
		products: response.products,
		recommendations: response.recommendations,
		orderStatus: response.orderStatus,
		promotions: response.promotions ?? [],
		faqs: response.faqs ?? [],
		shippingPolicy:
			response.policies?.filter((p) => {
				const title = p.title.toLowerCase()
				return (
					title.includes('giao hàng') ||
					title.includes('phạm vi') ||
					title.includes('vận chuyển') ||
					title.includes('ship') ||
					title.includes('phí') ||
					title.includes('thời gian')
				)
			}) ?? [],
		returnPolicy:
			response.policies?.filter((p) => {
				const title = p.title.toLowerCase()
				return title.includes('đổi trả') || title.includes('điều kiện')
			}) ?? [],
		sizeRecommendation: response.sizeGuide
	}
}

export default function AiChat() {
	const [isOpen, setIsOpen] = useState(false)
	const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()

	const { t } = useTranslation()
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])

	useEffect(() => {
		scrollToBottom()
	}, [messages, scrollToBottom])

	const handleMessage = useCallback(
		async (text: string) => {
			if (!text.trim() || isLoading) return

			const userMsg: ChatMessage = {
				id: generateId(),
				role: 'user',
				content: text.trim(),
				timestamp: new Date()
			}

			const loadingMsg: ChatMessage = {
				id: generateId(),
				role: 'assistant',
				content: '',
				timestamp: new Date(),
				loading: true
			}

			setMessages((prev) => [...prev, userMsg, loadingMsg])
			setInput('')
			setIsLoading(true)

			try {
				const history = messages.filter((m) => !m.loading)
				const response: ChatResponse = await aiChat(text.trim(), history)
				setMessages((prev) => [
					...prev.filter((m) => !m.loading),
					buildChatMessage(response)
				])
			} catch {
				setMessages((prev) => [
					...prev.filter((m) => !m.loading),
					{
						id: generateId(),
						role: 'assistant',
						content: 'Xin lỗi, đã có lỗi xảy ra. Bạn vui lòng thử lại sau nhé.',
						timestamp: new Date()
					}
				])
			} finally {
				setIsLoading(false)
			}
		},
		[messages, isLoading]
	)

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleMessage(input)
		}
	}

	return (
		<>
			{/* Toggle button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed z-50 bottom-6 right-6 flex items-center justify-center w-14 h-14 text-white! bg-red-800 rounded-full shadow-lg hover:bg-red-900 transition-all duration-300 hover:scale-110 cursor-pointer"
			>
				{isOpen ? (
					<CloseOutlined className="text-2xl" />
				) : (
					<CustomerServiceOutlined className="text-2xl" />
				)}
			</button>

			{/* Chat panel */}
			{isOpen && (
				<div className="fixed z-50 bottom-24 right-6 w-105 max-w-[calc(100vw-2rem)] h-150 max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-red-100 dark:border-gray-700 flex flex-col overflow-hidden">
					{/* Header */}
					<div className="flex items-center gap-3 px-5 py-4 text-white bg-red-800 shrink-0">
						<CustomerServiceOutlined className="text-2xl" />
						<div>
							<Title level={5} className="mb-0! text-white!">
								Wearly Assistant
							</Title>
							<Text className="text-white! text-xs">
								Trợ lý thời trang thông minh
							</Text>
						</div>
					</div>

					{/* Messages */}
					<div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
						{messages.map((msg) => (
							<div key={msg.id}>
								{msg.loading ? (
									<div className="flex items-start gap-2">
										<div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full shrink-0">
											<CustomerServiceOutlined className="text-sm text-red-800!" />
										</div>
										<div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-tl-sm dark:bg-gray-800 rounded-2xl">
											<LoadingOutlined className="text-red-800" />
											<Text className="text-sm text-gray-500">
												{t('admin.processing')}
											</Text>
										</div>
									</div>
								) : msg.role === 'user' ? (
									<div className="flex justify-end">
										<div className="px-4 py-2.5 bg-red-800 rounded-2xl rounded-br-sm max-w-[85%]">
											<Text className="text-sm text-white! whitespace-pre-wrap">
												{msg.content}
											</Text>
										</div>
									</div>
								) : (
									<div className="flex flex-col gap-2">
										{/* Text bubble */}
										<div className="flex items-start gap-2">
											<div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full shrink-0">
												<CustomerServiceOutlined className="text-sm text-red-800!" />
											</div>
											{msg.content && (
												<div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm max-w-[85%]">
													<Text className="text-sm text-gray-800 whitespace-pre-wrap dark:text-gray-200">
														{msg.content}
													</Text>
												</div>
											)}
										</div>

										{/* Products */}
										{msg.products && msg.products.length > 0 && (
											<div className="grid grid-cols-1 gap-2 ml-10">
												{msg.products.map((product) => (
													<Card
														key={product.id}
														size="small"
														hoverable
														className="rounded-xl! border-gray-200! dark:border-gray-700!"
														onClick={() => {
															setIsOpen(false)
															navigate(lp(`/products/${product.slug}`))
														}}
													>
														<div className="flex gap-3">
															{product.imageUrl && (
																<img
																	src={product.imageUrl}
																	alt={product.name}
																	className="object-cover w-16 h-16 rounded-lg bg-slate-100 shrink-0"
																	onError={(e) => {
																		e.currentTarget.style.display = 'none'
																	}}
																/>
															)}
															<div className="flex-1 min-w-0">
																<Text className="block text-sm font-medium line-clamp-2">
																	{product.name}
																</Text>
																<div className="flex items-center gap-2 mt-1">
																	<Text className="text-sm font-semibold text-red-800">
																		{formatCurrency(
																			product.salePrice ?? product.price
																		)}
																	</Text>
																	{product.salePrice != null && (
																		<Text className="text-xs text-gray-400 line-through">
																			{formatCurrency(product.price)}
																		</Text>
																	)}
																</div>
																<div className="flex items-center gap-1 mt-0.5">
																	<Rate
																		disabled
																		allowHalf
																		count={1}
																		value={product.averageRating > 0 ? 1 : 0}
																		className="text-xs! leading-none text-amber-500"
																	/>
																	<Text className="text-xs text-gray-400">
																		{product.averageRating.toFixed(1)} (
																		{product.reviewCount})
																	</Text>
																</div>
																<div className="flex flex-wrap gap-1 mt-1">
																	{product.colors.slice(0, 3).map((c) => (
																		<Tag
																			key={c}
																			className="text-[10px] px-1.5! py-0!"
																		>
																			{c}
																		</Tag>
																	))}
																	{product.sizes.slice(0, 5).map((s) => (
																		<Tag
																			key={s}
																			color="default"
																			className="text-[10px] px-1.5! py-0!"
																		>
																			{s}
																		</Tag>
																	))}
																</div>
															</div>
														</div>
													</Card>
												))}
											</div>
										)}

										{/* FAQs */}
										{msg.faqs && msg.faqs.length > 0 && (
											<div className="ml-10 space-y-2">
												{msg.faqs.map((faq, i) => (
													<Card
														key={i}
														size="small"
														className="rounded-xl! border-gray-200! dark:border-gray-700!"
													>
														<Text className="block text-sm font-medium">
															❓ {faq.question}
														</Text>
														<Text className="block mt-1 text-sm text-gray-600 dark:text-gray-400">
															{faq.answer}
														</Text>
													</Card>
												))}
											</div>
										)}

										{/* Shipping policy */}
										{msg.shippingPolicy && msg.shippingPolicy.length > 0 && (
											<div className="ml-10 space-y-2">
												{msg.shippingPolicy.map((policy, i) => (
													<Card
														key={i}
														size="small"
														className="rounded-xl! border-gray-200! dark:border-gray-700!"
													>
														<Text className="block text-sm font-medium">
															🚚 {policy.title}
														</Text>
														<Text className="block mt-1 text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">
															{policy.content}
														</Text>
													</Card>
												))}
											</div>
										)}

										{/* Return policy */}
										{msg.returnPolicy && msg.returnPolicy.length > 0 && (
											<div className="ml-10 space-y-2">
												{msg.returnPolicy.map((policy, i) => (
													<Card
														key={i}
														size="small"
														className="rounded-xl! border-gray-200! dark:border-gray-700!"
													>
														<Text className="block text-sm font-medium">
															📦 {policy.title}
														</Text>
														<Text className="block mt-1 text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">
															{policy.content}
														</Text>
													</Card>
												))}
											</div>
										)}

										{/* Promotions */}
										{msg.promotions && msg.promotions.length > 0 && (
											<div className="ml-10 space-y-2">
												{msg.promotions.map((promo, i) => (
													<Card
														key={i}
														size="small"
														className="rounded-xl! border-amber-200! dark:border-amber-800! bg-amber-50! dark:bg-amber-900/20!"
													>
														<Text className="block text-sm font-semibold text-amber-800 dark:text-amber-400">
															🎉 {promo.code}
														</Text>
														<Text className="block mt-1 text-sm">
															{promo.description}
														</Text>
														{promo.minOrderValue != null && (
															<Text className="block mt-1 text-xs text-gray-500">
																Đơn tối thiểu:{' '}
																{formatCurrency(promo.minOrderValue)}
															</Text>
														)}
													</Card>
												))}
											</div>
										)}

										{/* Size recommendation */}
										{msg.sizeRecommendation?.sizeGuide && (
											<div className="ml-10">
												<Card
													size="small"
													className="rounded-xl! border-gray-200!"
												>
													<Text className="block mb-2 text-sm font-medium">
														📏 Bảng size tham khảo
													</Text>
													<div className="overflow-x-auto">
														<table className="w-full text-xs">
															<thead>
																<tr className="border-b border-gray-200">
																	<th className="px-2 py-1 text-left">Size</th>
																	<th className="px-2 py-1 text-left">
																		Cao (cm)
																	</th>
																	<th className="px-2 py-1 text-left">
																		Nặng (kg)
																	</th>
																	<th className="px-2 py-1 text-left">
																		Ngực (cm)
																	</th>
																	<th className="px-2 py-1 text-left">
																		Eo (cm)
																	</th>
																</tr>
															</thead>
															<tbody>
																{msg.sizeRecommendation.sizeGuide.map((row) => (
																	<tr
																		key={row.size}
																		className={`border-b border-gray-100 ${row.size ===
																			msg.sizeRecommendation?.recommendedSize
																			? 'bg-red-50 dark:bg-red-900/20 font-medium'
																			: ''
																			}`}
																	>
																		<td className="px-2 py-1">{row.size}</td>
																		<td className="px-2 py-1">
																			{row.height || '-'}
																		</td>
																		<td className="px-2 py-1">
																			{row.weight || '-'}
																		</td>
																		<td className="px-2 py-1">
																			{row.chest || '-'}
																		</td>
																		<td className="px-2 py-1">
																			{row.waist || '-'}
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</Card>
											</div>
										)}

										{/* Order status */}
										{msg.orderStatus && (
											<div className="ml-10">
												<Card
													size="small"
													className="rounded-xl! border-gray-200!"
												>
													<div className="flex items-center gap-2 mb-2">
														<ShoppingOutlined className="text-lg" />
														<Text className="font-medium">
															Đơn hàng #{msg.orderStatus.orderId.slice(0, 8)}
														</Text>
													</div>
													<Tag
														color={
															msg.orderStatus.status === 'Delivered'
																? 'green'
																: msg.orderStatus.status === 'Cancelled'
																	? 'red'
																	: msg.orderStatus.status === 'Shipping'
																		? 'blue'
																		: 'orange'
														}
													>
														{msg.orderStatus.status}
													</Tag>
													{msg.orderStatus.history.length > 0 && (
														<div className="mt-2 space-y-1">
															{msg.orderStatus.history.map((h, i) => (
																<div
																	key={i}
																	className="flex items-center gap-2 text-xs text-gray-500"
																>
																	<div className="w-2 h-2 bg-red-800 rounded-full" />
																	<span>{h.status}</span>
																	<span>
																		{new Date(h.timestamp).toLocaleDateString(
																			'vi-VN'
																		)}
																	</span>
																</div>
															))}
														</div>
													)}
												</Card>
											</div>
										)}
									</div>
								)}
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>

					{/* Quick actions (only shown at start) */}
					{messages.length <= 2 && (
						<div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 shrink-0">
							<div className="flex flex-wrap gap-1.5">
								{QUICK_ACTIONS.map((action) => (
									<button
										key={action.label}
										onClick={() => setInput(action.message)}
										className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-800 rounded-full transition-colors"
									>
										{action.label}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Input */}
					<div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
						<div className="flex gap-2">
							<Input.TextArea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Nhập tin nhắn..."
								autoSize={{ minRows: 1, maxRows: 3 }}
								className="rounded-xl! border-gray-200! dark:border-gray-600! bg-gray-50! dark:bg-gray-800! resize-none!"
							/>
							<Button
								type="primary"
								icon={<SendOutlined />}
								onClick={() => handleMessage(input)}
								disabled={!input.trim() || isLoading}
								className="rounded-xl! flex! items-center! justify-center! w-10! h-10! shrink-0!"
							/>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
