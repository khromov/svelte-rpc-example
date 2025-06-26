<script lang="ts">
	import { getFibonacci } from './fibonacci.remote'
	const fib = getFibonacci(5000)
</script>

<main>
	<h1>Fibonacci Precomputed Value</h1>

	<p class="description">
		This page demonstrates the <code>prerender</code> remote function with the 100th Fibonacci
		number computed at build time using the <code>fibonacci</code> package.
	</p>

	<div class="highlight-card">
		<h3>F(5000)</h3>
		<p class="fib-value">{(await fib)?.value}</p>
		<div class="fib-stats">
			<p class="fib-info">Total digits: {(await fib)?.stats.totalDigits}</p>
		</div>
		<p class="timestamp">
			Precomputed at: {new Date((await fib)?.timestamp).toLocaleString()}
		</p>
	</div>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		color: var(--text-1);
		text-align: center;
	}

	h1 {
		color: var(--text-1);
		text-align: center;
		margin: 0 0 2rem 0;
		width: 100%;
		max-inline-size: none;
	}

	.description {
		background: var(--surface-2);
		color: var(--text-1);
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid var(--brand);
		margin-bottom: 2rem;
		text-align: center;
		margin-left: auto;
		margin-right: auto;
		width: fit-content;
	}

	.description code {
		background: var(--surface-3);
		color: var(--brand);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
	}

	.highlight-card {
		background: var(--surface-3);
		padding: 2rem;
		border-radius: 8px;
		border: 2px solid var(--brand);
		max-width: 800px;
		margin: 0 auto;
	}

	.highlight-card h3 {
		color: var(--brand);
		margin-bottom: 1rem;
		text-align: center;
		font-size: 1.5rem;
		max-inline-size: none !important;
	}

	.fib-value {
		font-family: monospace;
		font-size: 0.8rem;
		color: var(--text-1);
		word-break: break-all;
		margin-bottom: 1rem;
		max-height: 200px;
		overflow-y: auto;
		background: var(--surface-1);
		padding: 1rem;
		border-radius: 4px;
		border: 1px solid var(--border-color);
		text-align: left;
		line-height: 1.4;
		max-inline-size: none !important;
	}

	.fib-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.fib-info {
		color: var(--text-2);
		font-size: 0.9rem;
		font-weight: bold;
		text-align: center;
		background: var(--surface-2);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		margin: 0;
	}

	.timestamp {
		color: var(--text-2);
		font-size: 0.85rem;
		font-style: italic;
		text-align: center;
		max-inline-size: none !important;
	}

	@media (max-width: 768px) {
		.fib-value {
			font-size: 0.7rem;
		}

		.fib-stats {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
