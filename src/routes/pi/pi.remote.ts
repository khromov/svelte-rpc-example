import { prerender } from '$app/server'
import { calculatePi, getPiStats } from '$lib/pi'

// Prerender Pi values with specific digit precisions
export const getPi = prerender(
	async (digits: number) => {
		console.log(`Computing Pi to ${digits} digits at build time`)
		const piValue = calculatePi(digits)
		const stats = getPiStats(piValue)

		return {
			digits,
			value: piValue,
			stats,
			timestamp: new Date().toISOString()
		}
	},
	{
		entries: () => [[200]]
	}
)