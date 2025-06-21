<script lang="ts">
	import { getCounter, incrementCounter, resetCounter } from './counter.remote'

	// this behaves like a regular function but uses RPC
	const counter = getCounter()
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
	
	<p class="description">
		This counter is backed by SQLite and persists across page reloads!
	</p>
</main>

<style>
	main {
		text-align: center;
		padding: 2rem;
		max-width: 400px;
		margin: 0 auto;
	}
	
	.counter-display {
		margin: 2rem 0;
		padding: 2rem;
		background: #f5f5f5;
		border-radius: 8px;
		border: 2px solid #ddd;
	}
	
	.counter-value {
		font-size: 3rem;
		font-weight: bold;
		color: #333;
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
		background: #4CAF50;
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
	
	.description {
		color: #666;
		font-style: italic;
		margin-top: 2rem;
	}
</style>