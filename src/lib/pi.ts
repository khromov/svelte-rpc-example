import generatePi from 'generate-pi'

export function calculatePi(digits: number): string {
	// generate-pi.get() returns the full pi value including '3.'
	return generatePi.get(digits)
}

export function getPiStats(piValue: string) {
	const digits = piValue.length - 2 // subtract '3.'

	return {
		totalDigits: digits
	}
}
