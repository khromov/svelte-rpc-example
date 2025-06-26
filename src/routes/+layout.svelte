<script lang="ts">
	import '../app.css'
	import { page } from '$app/stores'
	import { Toaster } from 'svelte-french-toast'

	let { children } = $props()
</script>

<Toaster />

<nav class="main-nav">
	<a href="/" class:active={$page.route.id === '/'}>Counter</a>
	<a href="/counter-form" class:active={$page.route.id === '/counter-form'}>Counter (Form)</a>
	<a href="/fibonacci" class:active={$page.route.id === '/fibonacci'}>Fibonacci</a>
</nav>

<svelte:boundary>
	{#snippet failed(error, reset)}
		<button onclick={reset}>{error}Oops! try again</button>
	{/snippet}

	<!-- suspense -->
	{#snippet pending()}
		<p>loading...</p>
	{/snippet}

	{@render children()}
</svelte:boundary>

<style>
	.main-nav {
		display: flex;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--surface-2);
		border-bottom: 1px solid var(--border-color);
		justify-content: center;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.main-nav a {
		color: var(--text-2);
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.main-nav a:hover {
		color: var(--text-1);
		background: var(--surface-3);
	}

	.main-nav a.active {
		color: var(--brand);
		background: var(--surface-3);
		font-weight: bold;
	}
</style>
