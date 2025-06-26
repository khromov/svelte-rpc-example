import { prerender } from '$app/server'
import { calculateFibonacci, getFibonacciStats } from '$lib/fibonacci'

// Prerender the 100th Fibonacci number
export const getFibonacci = prerender(
	async (n: number) => {
		console.log(`Computing ${n}th Fibonacci number at build time`)
		const fibValue = calculateFibonacci(n)
		const stats = getFibonacciStats(fibValue)

		return {
			n,
			value: fibValue,
			stats,
			timestamp: new Date().toISOString()
		}
	},
	{
		entries: () => [[5000]]
	}
)
