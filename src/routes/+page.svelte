<script lang="ts">
	import { getCounter, incrementCounter, resetCounter, setCounter } from './counter.remote'
	import toast from 'svelte-french-toast'

	const counter = getCounter()

	let inputValue = $state('')
</script>

<main>
	<h1>Global Counter</h1>

	<div class="counter-display">
		<span class="counter-value">{await counter}</span>
	</div>

	<div class="buttons">
		<button
			onclick={async () => {
				// optimistic UI update
				const release = counter.override((current) => current + 1)

				try {
					await incrementCounter()
				} catch (error) {
					console.error('Failed to increment:', error)
					toast.error('Failed to increment counter')
				} finally {
					release()
				}
			}}
		>
			Increment
		</button>

		<button
			onclick={async () => {
				// optimistic UI update
				const release = counter.override(() => 0)

				try {
					await resetCounter()
				} catch (error) {
					console.error('Failed to reset:', error)
				} finally {
					release()
				}
			}}
		>
			Reset
		</button>
	</div>

	<div class="set-counter">
		<h2>Set Counter (With Validation)</h2>
		<p class="validation-info">Enter a number between 0 and 1000</p>
		<div class="input-group">
			<input type="text" bind:value={inputValue} placeholder="Enter value (0-1000)" />
			<button
				onclick={async () => {
					const value = parseInt(inputValue)
					if (isNaN(value)) {
						toast.error('Please enter a valid number')
						return
					}

					// optimistic UI update
					const release = counter.override(() => value)

					try {
						const result = await setCounter({ value })
						toast.success(`Counter set to ${result.value}`)
						inputValue = ''
					} catch (error) {
						console.error('Failed to set counter:', error)
						if (error.status === 422) {
							toast.error('Validation failed: Number must be between 0 and 1000')
						} else {
							toast.error('Failed to set counter')
						}
					} finally {
						release()
					}
				}}
			>
				Set Value
			</button>
		</div>
	</div>

	<p class="description">This counter is backed by SQLite and persists across page reloads!</p>
</main>

<style>
	main {
		text-align: center;
		padding: 2rem;
		max-width: 600px;
		margin: 0 auto;
		color: var(--text-1);
	}

	.counter-display {
		margin: 2rem 0;
		padding: 2rem;
		background: var(--surface-2);
		border-radius: 8px;
		border: 2px solid var(--border-color);
	}

	.counter-value {
		font-size: 3rem;
		font-weight: bold;
		color: var(--text-1);
	}

	.buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin: 2rem 0;
	}

	button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:first-child {
		background: #4caf50;
		color: white;
	}

	button:first-child:hover {
		background: #45a049;
	}

	button:last-child {
		background: #f44336;
		color: white;
	}

	button:last-child:hover {
		background: #da190b;
	}

	.set-counter {
		margin: 2rem 0;
		padding: 1.5rem;
		background: var(--surface-2);
		border-radius: 8px;
		border: 2px solid var(--brand);
	}

	.set-counter h2 {
		margin: 0 0 0.5rem 0;
		color: var(--brand);
	}

	.validation-info {
		color: var(--text-2);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.input-group {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.input-group input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--surface-1);
		color: var(--text-1);
		flex: 1;
		min-width: 200px;
	}

	.input-group button {
		background: var(--brand);
		color: var(--text-on-brand);
	}

	.input-group button:hover {
		background: var(--brand-hover);
	}

	.description {
		color: var(--text-2);
		font-style: italic;
		margin-top: 2rem;
	}
</style>
