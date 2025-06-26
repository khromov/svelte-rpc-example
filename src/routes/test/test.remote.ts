import { prerender } from '$app/server'
import { calculatePi } from '$lib/pi'

// Prerender Pi values with specific digit precisions
export const getPi = prerender(
	async (digits: number) => {
		console.log(`Computing Pi to ${digits} digits`)
		const value = calculatePi(digits)

		return {
			digits,
			value,
			timestamp: new Date().toISOString()
		}
	},
	{
		entries: () => [[10], [100]]
	}
)
