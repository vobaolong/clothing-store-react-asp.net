export const COUNTDOWN_MS_PER_DAY = 86_400_000

export function getRemainingMsUntil(end: string | number | Date, nowMs: number): number {
	const endMs =
		typeof end === 'number' && Number.isFinite(end)
			? end
			: new Date(end).getTime()
	if (!Number.isFinite(endMs)) return 0
	return Math.max(0, endMs - nowMs)
}

export function getRemainingWholeDays(remainingMs: number): number {
	if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 0
	return Math.floor(remainingMs / COUNTDOWN_MS_PER_DAY)
}

export function getStatisticTimerFormatForRemaining(
	remainingMs: number,
): 'D [Ngày] HH:mm:ss' | 'HH:mm:ss' {
	if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 'HH:mm:ss'
	return remainingMs < COUNTDOWN_MS_PER_DAY ? 'HH:mm:ss' : 'D [Ngày] HH:mm:ss'
}

export function getStatisticTimerFormatForSaleEnd(
	saleEndDate: string,
	nowMs: number,
): 'D [Ngày] HH:mm:ss' | 'HH:mm:ss' {
	return getStatisticTimerFormatForRemaining(
		getRemainingMsUntil(saleEndDate, nowMs),
	)
}
