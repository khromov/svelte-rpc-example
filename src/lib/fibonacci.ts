import fibonacci from 'fibonacci'

export function calculateFibonacci(n: number): string {
	const result = fibonacci.iterate(n)
	return result.number.toString()
}

export function getFibonacciStats(fibValue: string) {
	const digits = fibValue.length
	
	return {
		totalDigits: digits
	}
}