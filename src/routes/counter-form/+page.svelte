<script lang="ts">
	import { getCounter, incrementCounterForm, resetCounterForm } from './counter-form.remote'
	
	// This behaves like a regular function but uses RPC
	const counter = getCounter()
</script>

<main>
	<h1>Counter with Forms</h1>
	
	<p class="description">
		This page demonstrates the <code>form</code> remote function. Forms work without JavaScript 
		and automatically enhance with progressive enhancement for better UX.
	</p>
	
	<div class="counter-display">
		<span class="counter-value">{await counter}</span>
	</div>
	
	<div class="buttons">
		<form {...incrementCounterForm}>
			<button type="submit">
				Increment
			</button>
		</form>
		
		<form {...resetCounterForm}>
			<button type="submit" class="reset-button">
				Reset
			</button>
		</form>
	</div>
	
	{#if incrementCounterForm.result || resetCounterForm.result}
		<div class="results">
			{#if incrementCounterForm.result}
				<div class="result" class:success={incrementCounterForm.result.success} class:error={!incrementCounterForm.result.success}>
					{incrementCounterForm.result.success ? incrementCounterForm.result.message : incrementCounterForm.result.error}
				</div>
			{/if}
			{#if resetCounterForm.result}
				<div class="result success">
					{resetCounterForm.result.message}
				</div>
			{/if}
		</div>
	{/if}
	
	<p class="description">
		This counter uses <code>form</code> functions and persists across page reloads!
	</p>
</main>

<style>
	main {
		text-align: center;
		padding: 2rem;
		max-width: 600px;
		margin: 0 auto;
		color: var(--text-1);
	}
	
	.description {
		color: var(--text-2);
		font-style: italic;
		margin-bottom: 2rem;
	}
	
	.description code {
		background: var(--surface-3);
		color: var(--brand);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
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
	
	.buttons form {
		flex: 1;
	}
	
	button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		width: 100%;
		background: #4CAF50;
		color: white;
	}
	
	button:hover {
		background: #45a049;
	}
	
	.reset-button {
		background: #f44336;
		color: white;
	}
	
	.reset-button:hover {
		background: #da190b;
	}
	
	.results {
		margin: 1rem 0;
	}
	
	.result {
		margin: 0.5rem 0;
		padding: 0.75rem;
		border-radius: 4px;
		font-weight: bold;
	}
	
	.result.success {
		background: var(--green-2);
		color: var(--green-9);
		border: 1px solid var(--green-6);
	}
	
	.result.error {
		background: var(--red-2);
		color: var(--red-9);
		border: 1px solid var(--red-6);
	}
</style>