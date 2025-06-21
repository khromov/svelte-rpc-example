<script lang="ts">
	import { getFibonacci } from './fibonacci.remote'
</script>

<main>
	<h1>Fibonacci Precomputed Values</h1>

	<p class="description">
		This page demonstrates the <code>prerender</code> remote function with the 1,000th and 10,000th Fibonacci
		numbers precomputed at build time.
	</p>

	<div class="highlights-grid">
		<div class="highlight-card">
			<h3>F(10)</h3>
			<p class="fib-value">{await getFibonacci(10).then((r) => r.value)}</p>
			<p class="fib-info">
				The 1000th Fibonacci number has {await getFibonacci(1000).then((r) => r.value.length)} digits
			</p>
			<p class="timestamp">
				Precomputed at: {await getFibonacci(1000).then((r) =>
					new Date(r.timestamp).toLocaleString()
				)}
			</p>
		</div>
		<div class="highlight-card">
			<h3>F(100)</h3>
			<p class="fib-value">{await getFibonacci(100).then((r) => r.value)}</p>
			<p class="fib-info">
				The 10,000th Fibonacci number has {await getFibonacci(10000).then((r) => r.value.length)} digits
			</p>
			<p class="timestamp">
				Precomputed at: {await getFibonacci(10000).then((r) =>
					new Date(r.timestamp).toLocaleString()
				)}
			</p>
		</div>
	</div>
</main>

<style>
	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		color: var(--text-1);
	}

	h1 {
		color: var(--text-1);
		text-align: center;
	}

	.description {
		background: var(--surface-2);
		color: var(--text-1);
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid var(--brand);
		margin-bottom: 2rem;
		text-align: center;
	}

	.description code {
		background: var(--surface-3);
		color: var(--brand);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
	}

	.highlights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
		gap: 2rem;
	}

	.highlight-card {
		background: var(--surface-3);
		padding: 2rem;
		border-radius: 8px;
		border: 2px solid var(--brand);
	}

	.highlight-card h3 {
		color: var(--brand);
		margin-bottom: 1rem;
		text-align: center;
		font-size: 1.5rem;
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
	}

	.fib-info {
		color: var(--text-2);
		font-size: 1rem;
		font-weight: bold;
		text-align: center;
		margin-bottom: 0.5rem;
	}

	.timestamp {
		color: var(--text-2);
		font-size: 0.85rem;
		font-style: italic;
		text-align: center;
	}
</style>
