import { OrderStatus } from '@/enums'

export function canUpdateToStatus(current: string, next: string): boolean {
	if (current === next) return true
	switch (current) {
		case OrderStatus.PENDING:
			return next === OrderStatus.CONFIRMED || next === OrderStatus.CANCELLED
		case OrderStatus.CONFIRMED:
			return next === OrderStatus.SHIPPING || next === OrderStatus.CANCELLED
		case OrderStatus.SHIPPING:
			return next === OrderStatus.DELIVERED || next === OrderStatus.CANCELLED
		default:
			return false
	}
}

