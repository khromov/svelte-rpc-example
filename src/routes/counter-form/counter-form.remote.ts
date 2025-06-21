import { form, query } from '$app/server'
import { error } from '@sveltejs/kit'
import { getCounterValue, incrementCounterValue, resetCounterValue } from '$lib/db/counter'

export const getCounter = query(async () => {
	return getCounterValue()
})

export const incrementCounterForm = form(async (data: FormData) => {
	const randomDelay = Math.random() * 2500
	await new Promise((resolve) => setTimeout(resolve, randomDelay))

	// Simulate random errors
	if (Math.random() < 0.2) {
		return {
			success: false,
			error: 'Random error occurred while incrementing! 🎲',
			value: getCounterValue()
		}
	}

	incrementCounterValue()
	
	// Refresh the counter query for single-flight mutation
	await getCounter().refresh()

	return { 
		success: true, 
		message: 'Counter incremented successfully! 🎉',
		value: getCounterValue()
	}
})

export const resetCounterForm = form(async (data: FormData) => {
	resetCounterValue()
	
	// Refresh the counter query for single-flight mutation
	await getCounter().refresh()

	return { 
		success: true, 
		message: 'Counter reset to 0! ↺',
		value: 0
	}
})

