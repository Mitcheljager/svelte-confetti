<script>
	import { Confetti } from "svelte-confetti"
	import ToggleConfetti from "./ToggleConfetti.svelte"
</script>



<div class="wrapper">
	<div class="header">
		<h1>
			<Confetti
				infinite
				amount="10"
				x={[-0.5, -0.25]}
				y={[0.25, 0.5]}
				delay={[500, 2000]}
				colorArray={["var(--primary)"]} />

			<mark>Svelte</mark>&nbsp;Confetti

			<Confetti
				infinite
				amount="10"
				x={[0.25, 0.5]}
				y={[0.25, 0.5]}
				delay={[500, 2000]}
				colorArray={["white"]} />
		</h1>
	</div>

	<div class="block block--single">
		<p>Add a little bit of flair to your app with some confetti 🎊! There are no dependencies and it's tiny in size. Even better; it works without JavaScript with the help of SSR in SvelteKit <em>(this page doesn't use SSR though)</em>!</p>

		<div class="reduced-motion-only">
			It looks like you have enabled reduced motion. That's cool, but just be aware that the demos on this page will not work.
		</div>

		<p><a href="https://github.com/Mitcheljager/svelte-confetti">GitHub</a></p>

		<h2>Demo</h2>

		<p>Click these buttons to see their effect. Most of these are not just a single toggle, they are a combination of multiple props. Don't worry we'll go over each one in the documentation further down the page!</p>

		<div class="buttons">
			<ToggleConfetti>
				<button slot="label">
					Default
				</button>

				<Confetti />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Lots
				</button>

				<Confetti amount=200 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Little
				</button>

				<Confetti amount=10 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Large
				</button>

				<Confetti size=20 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Rounded
				</button>

				<Confetti rounded size=15 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Colored
				</button>

				<Confetti colorArray={["var(--primary)"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Multi Colored
				</button>

				<Confetti colorArray={["var(--primary)", "white", "green"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Images
				</button>

				<Confetti size=20 colorArray={["url(https://svelte.dev/favicon.png)", "url(https://github.githubassets.com/favicons/favicon-dark.png)"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Gradient
				</button>

				<Confetti size=20 colorArray={["linear-gradient(#c8102e, white, #003da5)"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Flag
				</button>

				<Confetti y={[0.15, 1.25]} x={[-1.15, -0.35]} colorArray={["#c8102e"]} />
				<Confetti y={[0.15, 1.25]} x={[-0.45, 0.45]} colorArray={["white"]} />
				<Confetti y={[0.15, 1.25]} x={[0.35, 1.15]} colorArray={["#003da5"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Vertical
				</button>

				<Confetti y={[1, 2]} x={[-0.25, 0.25]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Horizontal
				</button>

				<Confetti y={[0.25, 0.5]} x={[-4, 4]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Cone
				</button>

				<Confetti cone />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Explosion
				</button>

				<Confetti y={[-0.5, 0.5]} x={[-0.5, 0.5]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Spray
				</button>

				<Confetti delay={[0, 750]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">
					Feathered
				</button>

				<Confetti x={[-0.5, 0.5]} />
				<Confetti amount=10 x={[-1, -0.4]} y={[0.25, 0.75]} />
				<Confetti	amount=10 x={[0.4, 1]} y={[0.25, 0.75]} />
			</ToggleConfetti>

			<ToggleConfetti toggleOnce>
				<button slot="label">
					Constant
				</button>

				<Confetti infinite amount=20 delay={[0, 500]} />
			</ToggleConfetti>


			<ToggleConfetti toggleOnce relative={false}>
				<button slot="label">
					Fullscreen
				</button>

				<div style="position: fixed; top: -50px; left: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden;">
					<Confetti infinite duration=5000 amount=200 x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} fallDistance="100vh" />
				</div>
			</ToggleConfetti>
		</div>

		<h2>Installation</h2>

		<p>Install using Yarn or NPM.</p>

		<code class="well">
			yarn add <mark>svelte-confetti</mark>
		</code>

		<code class="well">
			npm install --save <mark>svelte-confetti</mark>
		</code>

		<p>Include the component in your app.</p>

		<code class="well">
			import &#123; <mark>Confetti</mark> &#125; from "<mark>svelte-confetti</mark>"
		</code>

		<code class="well">
			&lt;<mark>Confetti</mark> /&gt;
		</code>
	</div>

	<div class="block block--single">
		Made by <a href="https://github.com/Mitcheljager">Mitchel Jager</a>
	</div>

	<h2>Properties</h2>

	<div class="block block--single">
		<p>This is a list of all configurable properties.</p>

		<div class="table">
			<strong>Property</strong> <strong>Default</strong> <strong>Description</strong>

			<code>size</code> <code>10</code> <div>The max size in pixels of the individual confetti pieces.</div>
			<code>x</code> <code>[-0.75, 0.75]</code> <div>The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.</div>
			<code>y</code> <code>[0.25, 1]</code> <div>The max vertical range of the confetti pieces. Negative is down, positive is ip. [-1, 1] would mean maximum of 200px down and 200px up.</div>
			<code>duration</code> <code>2000</code> <div>Duration of the animation for each individual piece.</div>
			<code>infinite</code> <code>false</code> <div>If set to true the animation will play indefinitely.</div>
			<code>delay</code> <code>[0, 50]</code> <div>Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.</div>
			<code>colorRange</code> <code>[0, 360]</code> <div>Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.</div>
			<code>colorArray</code> <code>[]</code> <div>Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.</div>
			<code>amount</code> <code>50</code> <div>Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.</div>
			<code>iterationCount</code> <code>1</code> <div>How many times the animation will play before stopping. Is overwritten by the "infinite" property.</div>
			<code>fallDistance</code> <code>"200px"</code> <div>How far each piece falls. Accepts any css property, px, rem, vh, etc.</div>
			<code>rounded</code> <code>false</code> <div>Set to true to make each confetti piece rounded.</div>
			<code>cone</code> <code>false</code> <div>Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.</div>
		</div>
	</div>
</div>



<style>
	:global(:root) {
		--primary: #ff3e00;
		--primary-light: #ff602b;
		--text-color: #444;
		--text-color-light: #999;
		--text-color-lightest: black;
		--border-color: #edf3f0;
		--bg-well: #f6fafd;
		--bg-body: #fff;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--text-color: #b7c0d1;
			--text-color-light: #8e99af;
			--text-color-lightest: white;
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
		overflow-x: hidden;
	}

	h1 {
		display: flex;
		align-items: center;
		margin: 0;
		color: var(--text-color-lightest);
	}

	h2 {
		margin: 3rem 0 1.5rem;
		color: var(--text-color-lightest);
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

	button {
		appearance: none;
		-webkit-appearance: none;
		background: var(--primary);
		padding: 0.5rem 0.75rem;
		border: 0;
		border-radius: 0.25rem;
		font-size: 1rem;
		color: white;
		cursor: pointer;
		transition: outline 100ms, transform 100ms;
	}

	button:hover {
		background: var(--primary-light);
	}

	button:focus-visible:not(:active) {
		outline: 3px solid var(--text-color-lightest);
	}

	button:active {
		transform: scale(0.95);
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
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

	.reduced-motion-only {
		display: none;
		padding: 1rem;
		border: 2px solid var(--primary);
		border-radius: 0.5rem;
		color: var(--text-color-lightest);

	}

	@media (prefers-reduced-motion) {
		.reduced-motion-only {
			display: block;
		}
	}
</style>
