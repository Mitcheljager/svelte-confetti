<script>
	import { onMount } from "svelte"

	import { Confetti } from "svelte-confetti"
</script>



<div class="wrapper">
	<div class="header">
		<h1><mark>Svelte</mark> Confetti</h1>
	</div>

	<div class="block block--single">
		Made by <a href="https://github.com/Mitcheljager">Mitchel Jager</a>
	</div>
</div>



<style>
	:global(:root) {
		--primary: #ff3e00;
		--text-color: #444;
		--text-color-light: #999;
		--border-color: #edf3f0;
		--bg-well: #f6fafd;
		--bg-body: #fff;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--text-color: #b7c0d1;
			--text-color-light: #8e99af;
			--border-color: #363d49;
			--bg-well: #21242c;
			--bg-body: #16181d;
		}
	}

	:global(body) {
		padding: 0;
		margin: 0;
		background: var(--bg-body);
		color: var(--text-color);
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
	}

	h1 {
		margin: 0;
		color: white;
	}

	h2 {
		margin: 3rem 0 1.5rem;
		color: white;
	}

	code {
		display: block;
		margin-top: 1rem;
		color: var(--text-color-light);
		font-size: .75rem;
		line-height: 1.5em;
	}

	mark {
		background: none;
		color: var(--primary);
	}

	a {
		color: var(--primary);
	}

	p:first-child {
		margin-top: 0;
	}

	.well {
		padding: .35rem .5rem;
		border-radius: .5rem;
		border: 1px solid var(--border-color);
		background: var(--bg-well);
	}

	.header {
		margin: 6rem 0 0;
	}

	:global(.header svg) {
		width: 100%;
		height: 5px;
	}

	.wrapper {
		max-width: 540px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
	}

	.block {
		padding: 3rem 0;
		border-bottom: 1px solid var(--border-color);
	}

	@media (min-width: 600px) {
		.block {
			display: grid;
			grid-template-columns: 1fr auto;
			grid-gap: 1.5rem;
			justify-content: space-between;
		}
	}

	.block--single {
		display: block;
	}

	.description {
		margin-bottom: 1rem;
	}

	@media (min-width: 600px) {
		.description {
			margin-bottom: 0;
		}
	}

	.table {
		display: grid;
		grid-template-columns: 1fr 1fr 3fr;
		grid-gap: 1rem .5rem;
	}

	.table strong {
		color: var(--text-color);
	}

	.table code {
		margin-top: 0;
		line-height: 1.3rem;
	}

	.chart {
		margin-top: .5rem;
	}

	:global(.chart--responsive svg) {
		width: 100%;
		height: auto;
	}

	table {
		width: 100%;
		border: 1px solid var(--border-color);
		border-radius: .5rem;
		border-collapse: collapse;
		background: var(--bg-well);
		font-size: clamp(0.75rem, 3vw, 1rem);
		color: var(--text-color-light);
		font-style: italic;
	}

	table tr:nth-child(even) td {
		background: var(--bg-body);
	}

	table tr td,
	table tr th {
		border: 0;
		padding: 0.5rem 0 0.5rem 1rem;
		text-align: left;
	}

	table :global(svg) {
		max-width: 100%;
		height: auto;
	}

	table .label {
		color: var(--text-color);
		font-style: normal;
	}
</style>
