import { command, query } from '$app/server'
import { error } from '@sveltejs/kit'
import { getCounterValue, incrementCounterValue, resetCounterValue } from '$lib/db/counter'

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
