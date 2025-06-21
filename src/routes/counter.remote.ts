import { command, query } from '$app/server'
import { error, validate } from '@sveltejs/kit'
import { getCounterValue, incrementCounterValue, resetCounterValue, setCounterValue } from '$lib/db/counter'
import { z } from 'zod'

export const getCounter = query(async () => {
	return getCounterValue()
})

export const incrementCounter = command(async () => {
	const randomDelay = Math.random() * 2500
	await new Promise((resolve) => setTimeout(resolve, randomDelay))

	if (Math.random() < 0.2) {
		error(500, 'This is a random error when deleting a todo! 🎉')
	}

	incrementCounterValue()

	// Refresh the counter query for single-flight mutation
	await getCounter().refresh()

	return { success: true }
})

export const resetCounter = command(async () => {
	resetCounterValue()

	// Refresh the counter query for single-flight mutation
	await getCounter().refresh()

	return { success: true }
})

// Schema for validation
const setCounterSchema = z.object({
	value: z.number().int().min(0).max(1000)
})

// New validated command to set counter to specific value
export const setCounter = command(
	validate(
		setCounterSchema,
		async ({ value }) => {
			// value is typed correctly. if the function
			// was called with bad arguments, it will
			// result in a 422 response
			setCounterValue(value)

			// Refresh the counter query for single-flight mutation
			await getCounter().refresh()

			return { success: true, value }
		}
	)
)
