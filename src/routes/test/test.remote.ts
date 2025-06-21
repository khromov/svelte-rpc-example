import { prerender } from '$app/server'
import { calculateFibonacci } from '$lib/fibonacci'

// Prerender single fibonacci numbers with specific entries
export const getFibonacci = prerender(
	async (index: number) => {
		console.log(`Calculating Fibonacci for index: ${index}`)
		const value = calculateFibonacci(index)

		return {
			index,
			value: value.toString(),
			timestamp: new Date().toISOString()
		}
	},
	{
		entries: () => [[10], [100]]
	}
)
