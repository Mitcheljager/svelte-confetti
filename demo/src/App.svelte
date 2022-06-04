<script>
	import { Confetti } from "svelte-confetti"
	import ToggleConfetti from "./ToggleConfetti.svelte"
	import ConfettiOnClick from "./ConfettiOnClick.svelte"
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

	<div class="block">
		<p>Add a little bit of flair to your app with some confetti 🎊! There are no dependencies and it's tiny in size. Even better; it works without JavaScript with the help of SSR in SvelteKit <em>(this page doesn't use SSR though)</em>!</p>

		<div class="reduced-motion-only">
			It looks like you have enabled reduced motion. That's cool, but just be aware that the demos on this page will not work.
		</div>

		<p><a target="_blank" href="https://github.com/Mitcheljager/svelte-confetti">GitHub</a> | <a target="_blank" href="https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597">REPL</a></p>

		<h2>Demo</h2>

		<p>Click these buttons to see their effect. Most of these are not just a single toggle, they are a combination of multiple props. Don't worry we'll go over each one in the documentation further down the page!</p>

		<div class="buttons">
			<ToggleConfetti>
				<button slot="label">Default</button>

				<Confetti />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Lots</button>

				<Confetti amount=200 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Few</button>

				<Confetti amount=10 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Large</button>

				<Confetti size=20 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Rounded</button>

				<Confetti rounded size=15 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Colored</button>

				<Confetti colorArray={["var(--primary)"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Multi Colored</button>

				<Confetti colorArray={["var(--primary)", "white", "green"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Images</button>

				<Confetti size=20 colorArray={["url(https://svelte.dev/favicon.png)", "url(https://github.githubassets.com/favicons/favicon-dark.png)"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Gradient</button>

				<Confetti size=20 colorArray={["linear-gradient(#c8102e, white, #003da5)"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Flag</button>

				<Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={["#c8102e"]} />
				<Confetti y={[1, 1.25]} x={[-1, 1]} colorArray={["white"]} />
				<Confetti y={[0.75, 1]} x={[-1, 1]} colorArray={["#003da5"]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Vertical</button>

				<Confetti y={[1, 2]} x={[-0.25, 0.25]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Horizontal</button>

				<Confetti y={[0.25, 0.5]} x={[-4, 4]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Cone</button>

				<Confetti cone />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">All around</button>

				<Confetti y={[-0.5, 0.5]} x={[-0.5, 0.5]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Explosion</button>

				<Confetti y={[-1, 1]} x={[-1, 1]} noGravity duration=750 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Sparkles</button>

				<Confetti y={[-0.5, 0.5]} x={[-0.5, 0.5]} colorRange={[30, 50]} amount=20 fallDistance=0px duration=3000 size=4 />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Spray</button>

				<Confetti delay={[0, 750]} />
			</ToggleConfetti>

			<ToggleConfetti>
				<button slot="label">Feathered</button>

				<Confetti cone x={[-0.5, 0.5]} />
				<Confetti cone amount=10 x={[-1, -0.4]} y={[0.25, 0.75]} />
				<Confetti cone amount=10 x={[0.4, 1]} y={[0.25, 0.75]} />
			</ToggleConfetti>

			<ToggleConfetti toggleOnce>
				<button slot="label">Constant</button>

				<Confetti infinite amount=20 delay={[0, 500]} />
			</ToggleConfetti>

			<ToggleConfetti toggleOnce relative={false}>
				<button slot="label">Fullscreen</button>

				<div style="position: fixed; top: -50px; left: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;">
					<Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]}  infinite duration=5000 amount=200 fallDistance="100vh" />
				</div>
			</ToggleConfetti>
		</div>

		<br>

		<ConfettiOnClick />

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

	<h2>Usage</h2>

	<mark>The Confetti comes without the buttons you will see in these examples. The buttons are simply used to demonstrate the effect in these docs.</mark>

	<div class="block">
		<div class="description">
			The component in it's most basic form.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Default</button>

					<Confetti />
				</ToggleConfetti>

				<code>
					&lt;Confetti /&gt;
				</code>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Spread</h3>

		<div class="description">
			The spread of confetti can be adjusted. The props <mark>x</mark> and <mark>y</mark> are used to determine how far the confetti spreads. For both values multipliers are used and these are to be supplied in an array of two with the lowest number first. For each confetti piece a random number between these two is picked. The higher the number the futher the spread. Negative numbers affect the direction.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Default</button>

					<Confetti x={[-0.5, 0.5]} y={[0.25, 1]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>x</mark>=&#123;[-0.5, 0.5]&#125; <mark>y</mark>=&#123;[0.25, 1]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Left</button>

					<Confetti x={[-1, -0.25]} y={[0, 0.5]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>x</mark>=&#123;[-1, -0.25]&#125; <mark>y</mark>=&#123;[0, 0.5]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Right</button>

					<Confetti x={[0.25, 1]} y={[0, 0.5]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>x</mark>=&#123;[0.25, 1]&#125; <mark>y</mark>=&#123;[0, 0.5]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Up</button>

					<Confetti x={[-0.25, 0.25]} y={[0.75, 1.5]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>x</mark>=&#123;[-0.25, 0.25]&#125; <mark>y</mark>=&#123;[0.75, 1.5]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Down</button>

					<Confetti x={[-0.25, 0.25]} y={[-0.75, -0.25]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>x</mark>=&#123;[-0.25, 0.25]&#125; <mark>y</mark>=&#123;[-0.75, -0.25]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Everywhere</button>

					<Confetti x={[-0.5, 0.5]} y={[-0.5, 0.5]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>x</mark>=&#123;[-0.5, 0.5]&#125; <mark>y</mark>=&#123;[-0.5, -0.5]&#125; /&gt;
				</code>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Amount</h3>

		<div class="description">
			The amount of particles that are launched can be adjusted with the <mark>amount</mark> property. This should always be a whole number. Be careful with going too high as it may impact performance. It will depends on the device and other performance heavy elements on the page, but try and keep it below 500.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Few</button>

					<Confetti amount=10 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>amount</mark>=10 /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Default</button>

					<Confetti amount=50 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>amount</mark>=50 /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Lots</button>

					<Confetti amount=200 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>amount</mark>=200 /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Too many</button>

					<Confetti amount=500 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>amount</mark>=500 /&gt;
				</code>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Shape</h3>

		<div class="description">
			As you may have noticed from the previous buttons, the confetti tends to take on a fairly square shape. This can be mitigated a little bit by using the propery <mark>cone</mark>. This will cause the confetti to launch in a more cone like shape which is especially nice when using lots of particles.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Default</button>

					<Confetti amount=200 />
				</ToggleConfetti>

				<code>
					&lt;Confetti amount=200 /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Cone</button>

					<Confetti cone amount=200 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>cone</mark> amount=200 /&gt;
				</code>
			</div>

			This is especially effective when firing to the side, but we need to compensate with a larger x multiplier.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Right</button>

					<Confetti x={[0.25, 1]} y={[0, 0.5]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti x=&#123;[0.25, 1]&#125; y=&#123;[0, 0.5]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Right Cone</button>

					<Confetti cone x={[1, 2.5]} y={[0.25, 0.75]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>cone</mark> x=&#123;[1, 2.5]&#125; y=&#123;[0.25, 0.75]&#125; /&gt;
				</code>
			</div>

			The cones still have a fairly distinct cone shape to them, later on in these docs we will go over how to mitigate this.
		</div>
	</div>

	<div class="block">
		<h3>Size</h3>

		<div class="description">
			The size of the confetti pieces can be adjusted using the <mark>size</mark> property.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Tiny</button>

					<Confetti size=2 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>size</mark>=2 /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Huge</button>

					<Confetti size=30 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>size</mark>=30 /&gt;
				</code>
			</div>

			We can also adjust the shape of the confetti pieces using the <mark>rounded</mark> property

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Round</button>

					<Confetti rounded size=30 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>rounded</mark> size=30 /&gt;
				</code>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Timing</h3>

		<div class="description">
			By default all confetti comes out at just about the same time. There is a little bit of variance but it appears instant. That's what a confetti cannon does. We can change when each piece is fired by adjusted the range of the <mark>delay</mark> property. The delay is given in milliseconds.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Short delay</button>

					<Confetti delay={[0, 250]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>delay</mark>=&#123;[0, 250]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Long delay</button>

					<Confetti delay={[0, 1500]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>delay</mark>=&#123;[0, 1500]&#125; /&gt;
				</code>
			</div>

			We can also opt to have the animation play infinitely by setting the <mark>infinite</mark> property, at this point the delay mostly has a effect only when spawning in for the first time. (Click the button again to toggle it off)

			<div class="button-code-group">
				<ToggleConfetti toggleOnce>
					<button slot="label">Default</button>

					<Confetti infinite />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>infinite</mark> /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti toggleOnce>
					<button slot="label">Long delay</button>

					<Confetti infinite delay={[0, 1500]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>infinite</mark> <mark>delay</mark>=&#123;[0, 1500]&#125; /&gt;
				</code>
			</div>

			Alternatively we can let the animation play out fully before repeating. For this we can use the <mark>iterationCount</mark> property. This is especially useful during development to tweak the confetti without having to reload the page or set up a button. This can be set to a number or to "infinite", basically anything that would be accepted by the animation-iteration-count property in CSS.

			<div class="button-code-group">
				<ToggleConfetti toggleOnce>
					<button slot="label">Infinite</button>

					<Confetti iterationCount=infinite />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>iterationCount</mark>=infinite /&gt;
				</code>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Color</h3>

		<div class="description">
			You can adjust the colors of the confetti pieces in different ways. You can specify a hue using the <mark>colorRange</mark> property, which will use HSL colors with 75% saturation and 50% lightness. 0-360 is all colors, 75-175 would be only greens. Alternatively you can specifiy colors in an array using <mark>colorArray</mark>. This can take any CSS value that would be accepted as the background property. RGB, HEX, HSL, but even gradients and images.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Green range</button>

					<Confetti colorRange={[75, 175]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>colorRange</mark>=&#123;[75, 175]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Array</button>

					<Confetti colorArray={["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>colorArray</mark>=&#123;["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Different values</button>

					<Confetti colorArray={["var(--primary)", "rgba(0, 255, 0, 0.5)", "white"]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>colorArray</mark>=&#123;["var(--primary)", "rgba(0, 255, 0, 0.5)", "white"]&#125; /&gt;
				</code>
			</div>

			It's not just colors though, we can input any value valid to the background css property. This includes gradients and images.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Gradient</button>

					<Confetti size=20 colorArray={["linear-gradient(var(--primary), blue)"]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>colorArray</mark>=&#123;["linear-gradient(var(--primary), blue)"]&#125; /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Images</button>

					<Confetti size=20 colorArray={["url(https://svelte.dev/favicon.png)", "url(https://github.githubassets.com/favicons/favicon-dark.png)"]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>colorArray</mark>=&#123;["url(https://svelte.dev/favicon.png)", "url(https://github.githubassets.com/favicons/favicon-dark.png)"]&#125; /&gt;
				</code>
			</div>

			Or we could set up a random color each time the component is mounted.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Random</button>

					<Confetti colorArray={[`hsl(${Math.floor(Math.random() * 360)}, 75%, 50%)`]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>colorArray</mark>=&#123;[`hsl($&#123;Math.floor(Math.random() * 360)&#125;, 75%, 50%)`]&#125; /&gt;
				</code>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Gravity</h3>

		<div class="description">
			We can change how the confetti falls using the <mark>fallDistance</mark> property. We can make it fall faster, slow, or stop it from falling altogether. This property will accept any valid css property, except for 0.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Slow fall</button>

					<Confetti fallDistance=50px />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>fallDistance</mark>=50px /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Fast fall</button>

					<Confetti fallDistance=200px />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>fallDistance</mark>=200px /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<div slot="label">
						<button>
							No fall
					</button>

						<small>Notice how it's set to <code class="inline">0px</code> and not just <code class="inline">0</code></small>
					</div>

					<Confetti fallDistance=0px />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>fallDistance</mark>=0px /&gt;
				</code>
			</div>

			We can also disable gravity and air resistance altogether and make it travel at a constant speed by setting the <mark>noGravity</mark> property.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">No gravity</button>

					<Confetti noGravity duration=500 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>noGravity</mark> duration=500 /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">No gravity explosion</button>

					<Confetti noGravity duration=500 x={[-0.5, 0.5]} y={[-0.5, 0.5]} />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>noGravity</mark> duration=500 x=&#123;[-0.5, 0.5]&#125; y=&#123;[-0.5, 0.5]&#125; /&gt;
				</code>
			</div>

			We can set how far the particles spread horizontally before and after the peak using the <mark>xSpread</mark> property. This expects a number between 0 and 1 but you can set it higher or lower for some odd results.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Small spread</button>

					<Confetti xSpread=0.1 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>xSpread</mark>=0.1 /&gt;
				</code>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Large spread</button>

					<Confetti xSpread=0.4 />
				</ToggleConfetti>

				<code>
					&lt;Confetti <mark>xSpread</mark>=0.4 /&gt;
				</code>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Multiple components</h3>

		<div class="description">
			We can combine multiple Confetti components to create neat effects.<br>
			For example we could combine multiple components each with different colors and different areas to create flags! <small>(Blues aren't the actual flag colors to make it a little easier to see on dark backgrounds)</small>

			<br><br>

			<div>
				<ToggleConfetti>
					<button slot="label">Dutch</button>

					<Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={["#c8102e"]} />
					<Confetti y={[1, 1.25]} x={[-1, 1]} colorArray={["white"]} />
					<Confetti y={[0.75, 1]} x={[-1, 1]} colorArray={["#3350ec"]} />
				</ToggleConfetti>

				<code class="well">
					&lt;Confetti y=&#123;[1.25, 1.5]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#c8102e"]&#125; /&gt; <br>
					&lt;Confetti  y=&#123;[1, 1.25]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["white"]&#125; /&gt; <br>
					&lt;Confetti  y=&#123;[0.75, 1]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#3350ec"]&#125; /&gt; <br>
				</code>
			</div>

			<br>

			<div>
				<ToggleConfetti>
					<button slot="label">Swedish</button>

					<Confetti y={[0.75, 1.5]} x={[-1, 1]} colorArray={["#3350ec"]} amount=100 />
					<Confetti y={[1.05, 1.20]} x={[-1, 1]} colorArray={["#ffcd00"]} amount=50 />
					<Confetti y={[0.75, 1.5]} x={[-0.5, -0.25]} colorArray={["#ffcd00"]} amount=20 />
				</ToggleConfetti>

				<code class="well">
					&lt;Confetti y=&#123;[0.75, 1.5]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#004b87"]&#125; amount=100 /&gt; <br>
					&lt;Confetti y=&#123;[1.05, 1.20]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#ffcd00"]&#125; amount=50 /&gt; <br>
					&lt;Confetti y=&#123;[0.75, 1.5]&#125; x=&#123;[-0.5, -0.25]&#125; colorArray=&#123;["#ffcd00"]&#125; amount=20 /&gt; <br>
				</code>
			</div>

			<br>

			<div>
				<ToggleConfetti>
					<div slot="label">
						<button>
							USA
					</button>

					</div>

					<Confetti y={[1.15, 1.5]} x={[-1, -0.25]} colorArray={["#3350ec"]} amount=100 />
					<Confetti y={[1.20, 1.45]} x={[-0.95, -0.3]} colorArray={["white"]} size=5 />
					<Confetti y={[1.45, 1.5]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 />
					<Confetti y={[1.4, 1.45]} x={[-0.25, 1]} colorArray={["white"]} amount=70 />
					<Confetti y={[1.35, 1.4]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 />
					<Confetti y={[1.3, 1.35]} x={[-0.25, 1]} colorArray={["white"]} amount=70 />
					<Confetti y={[1.25, 1.3]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 />
					<Confetti y={[1.2, 1.25]} x={[-0.25, 1]} colorArray={["white"]} amount=70 />
					<Confetti y={[1.15, 1.2]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 />
					<Confetti y={[1.1, 1.15]} x={[-1, 1]} colorArray={["white"]} amount=70 />
					<Confetti y={[1.05, 1.1]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 />
					<Confetti y={[1, 1.05]} x={[-1, 1]} colorArray={["white"]} amount=70 />
					<Confetti y={[0.95, 1]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 />
					<Confetti y={[0.9, 0.95]} x={[-1, 1]} colorArray={["white"]} amount=70 />
					<Confetti y={[0.85, 0.9]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 />
				</ToggleConfetti>

				<small>This one is heavy! This uses 1015 effects, more than recommended, but it looks neat!</small>

				<code class="well">
					&lt;Confetti y=&#123;[1.20, 1.45]&#125; x=&#123;[-0.95, -0.3]&#125; colorArray=&#123;["white"]&#125; size=5 /&gt; <br>
					&lt;Confetti y=&#123;[1.45, 1.5]&#125; x=&#123;[-0.25, 1]&#125; colorArray=&#123;["#bf0d3e"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.4, 1.45]&#125; x=&#123;[-0.25, 1]&#125; colorArray=&#123;["white"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.35, 1.4]&#125; x=&#123;[-0.25, 1]&#125; colorArray=&#123;["#bf0d3e"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.3, 1.35]&#125; x=&#123;[-0.25, 1]&#125; colorArray=&#123;["white"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.25, 1.3]&#125; x=&#123;[-0.25, 1]&#125; colorArray=&#123;["#bf0d3e"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.2, 1.25]&#125; x=&#123;[-0.25, 1]&#125; colorArray=&#123;["white"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.15, 1.2]&#125; x=&#123;[-0.25, 1]&#125; colorArray=&#123;["#bf0d3e"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.1, 1.15]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["white"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1.05, 1.1]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#bf0d3e"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[1, 1.05]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["white"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[0.95, 1]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#bf0d3e"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[0.9, 0.95]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["white"]&#125; amount=70 /&gt; <br>
					&lt;Confetti y=&#123;[0.85, 0.9]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#bf0d3e"]&#125; amount=70 /&gt; <br>
				</code>
			</div>

			<br>

			Flags are cool, but we can do plenty of other things. In this example we will "feather" the initial effect to give it a less defined shape. By default the effects have a fairly distinct shape to them which ruins the effect a little bit, especially when using lots of particles.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Not feathered</button>

					<Confetti amount=70 x={[-0.5, 0.5]} />
				</ToggleConfetti>

				<div>
					<code>
						&lt;Confetti y=&#123;[1.25, 1.5]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#c8102e"]&#125; /&gt;
					</code>
				</div>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Feathered</button>

					<Confetti x={[-0.5, 0.5]} />
					<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} />
					<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} />
				</ToggleConfetti>

				<div>
					<code>
						&lt;Confetti x=&#123;[-0.5, 0.5]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti amount=10 x=&#123;[-0.75, -0.3]&#125; y=&#123;[0.15, 0.75]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti amount=10 x=&#123;[0.3, 0.75]&#125; y=&#123;[0.15, 0.75]&#125; /&gt;
					</code>
				</div>
			</div>

			And with the cone property

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Cone</button>

					<Confetti cone amount=70 x={[-0.5, 0.5]} />
				</ToggleConfetti>

				<div>
					<code>
						&lt;Confetti cone amount=70 x=&#123;[-0.5, 0.5]&#125; /&gt;
					</code>
				</div>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Feathered cone</button>

					<Confetti cone x={[-0.5, 0.5]} />
					<Confetti cone amount=10 x={[-0.75, -0.4]} y={[0.15, 0.75]} />
					<Confetti cone amount=10 x={[0.4, 0.75]} y={[0.15, 0.75]} />
				</ToggleConfetti>

				<div>
					<code>
						&lt;Confetti cone x=&#123;[-0.5, 0.5]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti cone amount=10 x=&#123;[-0.75, -0.4]&#125; y=&#123;[0.15, 0.75]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti cone amount=10 x=&#123;[0.4, 0.75]&#125; y=&#123;[0.15, 0.75]&#125; /&gt;
					</code>
				</div>
			</div>

			We can also combine this with a large delay to mitigate the effect further, but it makes it less cannon-y.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Feathered and delayed</button>

					<Confetti x={[-0.5, 0.5]} delay={[0, 250]} />
					<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} delay={[0, 1000]} />
					<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} delay={[0, 1000]} />
				</ToggleConfetti>

				<div>
					<code>
						&lt;Confetti x=&#123;[-0.5, 0.5]&#125; delay=&#123;[0, 250]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti amount=10 x=&#123;[-0.75, -0.3]&#125; y=&#123;[0.15, 0.75]&#125; delay=&#123;[0, 1000]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti amount=10 x=&#123;[0.3, 0.75]&#125; y=&#123;[0.15, 0.75]&#125; delay=&#123;[0, 1000]&#125; /&gt;
					</code>
				</div>
			</div>

			We could also combine multiple components to create animations.

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Animate</button>

					<Confetti cone x={[-1, -0.25]} colorRange={[100, 200]} />
					<Confetti cone x={[-0.35, 0.35]} delay={[500, 550]} colorRange={[200, 300]} />
					<Confetti cone x={[0.25, 1]} delay={[250, 300]} colorRange={[100, 200]} />
					<Confetti cone amount=20 x={[-1, 1]} y={[0, 1]} delay={[0, 550]} colorRange={[200, 300]} />
				</ToggleConfetti>

				<div>
					<code>
						&lt;Confetti cone x=&#123;[-1, -0.25]&#125; colorRange=&#123;[100, 200]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti cone x=&#123;[-0.35, 0.35]&#125; delay=&#123;[500, 550]&#125; colorRange=&#123;[200, 300]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti cone x=&#123;[0.25, 1]&#125; delay=&#123;[250, 300]&#125; colorRange=&#123;[100, 200]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti cone amount=20 x=&#123;[-1, 1]&#125; y=&#123;[0, 1]&#125; delay=&#123;[0, 550]&#125; colorRange=&#123;[200, 300]&#125; /&gt;
					</code>
				</div>
			</div>

			<div class="button-code-group">
				<ToggleConfetti>
					<button slot="label">Animate explosion</button>

					<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[0, 50]} duration=1000 colorRange={[0, 120]} />
					<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[550, 550]} duration=1000 colorRange={[120, 240]} />
					<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[1000, 1050]} duration=1000 colorRange={[240, 360]} />
				</ToggleConfetti>

				<div>
					<code>
						&lt;Confetti noGravity x=&#123;[-1, 1]&#125; y=&#123;[-1, 1]&#125; delay=&#123;[0, 50]&#125; duration=1000 colorRange=&#123;[0, 120]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti noGravity x=&#123;[-1, 1]&#125; y=&#123;[-1, 1]&#125; delay=&#123;[550, 550]&#125; duration=1000 colorRange=&#123;[120, 240]&#125; /&gt;
					</code>
					<code>
						&lt;Confetti noGravity x=&#123;[-1, 1]&#125; y=&#123;[-1, 1]&#125; delay=&#123;[1000, 1050]&#125; duration=1000 colorRange=&#123;[240, 360]&#125; /&gt;
					</code>
				</div>
			</div>
		</div>
	</div>

	<div class="block">
		<h3>Styling it further</h3>

		<div class="description">
			We've now looked at all the different properties, but since this is just HTML and CSS you can style it further however you like. Let's look at some fullscreen examples. Having the effect fullscreen is not a simple toggle, but it is a simple bit of CSS.

			<br><br>

			<div>
				<ToggleConfetti toggleOnce relative={false}>
					<button slot="label">Fullscreen</button>

					<div style="position: fixed; top: -50px; left: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;">
						<Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]}  infinite duration=5000 amount=200 fallDistance="100vh" />
					</div>
				</ToggleConfetti>

				<code class="well">
					&lt;div style="<br>
						position: fixed;<br>
						top: -50px;<br>
						left: 0;<br>
						height: 100vh;<br>
						width: 100vw;<br>
						display: flex;<br>
						justify-content: center;<br>
						overflow: hidden;<br>
						pointer-events: none;"&gt;<br>
						&lt;Confetti x=&#123;[-5, 5]&#125; y=&#123;[0, 0.1]&#125; delay=&#123;[500, 2000]&#125; infinite duration=5000 amount=200 fallDistance="100vh" /&gt;
						<br>
					&lt;/div&gt;
				</code>
			</div>

			<br>

			The element is fixed and placed just off screen so we can't see the confetti spawn in. The <mark>fallDistance</mark> property is set to <code class="inline">100vh</code> so they cover the entire screen.

			<br>
			<br>

			One thing you may have noticed is that if you click a button the previous confetti disappears immediately and new ones spawn in. We could change this by creating a new component for each click. Check out the code for this example in the <a target="_blank" href="https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597">REPL</a>.

			<br>
			<br>

			<ConfettiOnClick />

			<br>
			<br>
			<br>
			<br>

			You could also further style the confetti itself. Don't like the animation? Do it yourself! Target the confetti with <code class="inline">:global(.confetti)</code> and change the animation using <code class="inline">animation-name</code>, all values are set as css variables so you can easily use them yourself.
		</div>
	</div>

	<h2>Properties</h2>

	<div class="block">
		<p>This is a list of all configurable properties.</p>

		<div class="table">
			<strong>Property</strong> <strong>Default</strong> <strong>Description</strong>

			<code>size</code> <code>10</code> <div>The max size in pixels of the individual confetti pieces.</div>
			<code>x</code> <code>[-0.5, 0.5]</code> <div>The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.</div>
			<code>y</code> <code>[0.25, 1]</code> <div>The max vertical range of the confetti pieces. Negative is down, positive is up. [-1, 1] would mean maximum of 200px down and 200px up.</div>
			<code>duration</code> <code>2000</code> <div>Duration of the animation for each individual piece.</div>
			<code>infinite</code> <code>false</code> <div>If set to true the animation will play indefinitely.</div>
			<code>delay</code> <code>[0, 50]</code> <div>Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.</div>
			<code>colorRange</code> <code>[0, 360]</code> <div>Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.</div>
			<code>colorArray</code> <code>[]</code> <div>Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.</div>
			<code>amount</code> <code>50</code> <div>Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.</div>
			<code>iterationCount</code> <code>1</code> <div>How many times the animation will play before stopping. Is overwritten by the "infinite" property.</div>
			<code>fallDistance</code> <code>"100px"</code> <div>How far each piece falls. Accepts any css property, px, rem, vh, etc, but not 0.</div>
			<code>rounded</code> <code>false</code> <div>Set to true to make each confetti piece rounded.</div>
			<code>cone</code> <code>false</code> <div>Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.</div>
			<code>noGravity</code> <code>false</code> <div>Set to true to make the particles accelerate at a constant speed without "falling" down. Give it a more explosion like effect.</div>
			<code>xSpread</code> <code>0.15</code> <div>A number from 0 to 1 that determines how far the particles spread horizontally. A low number will mean the x near the peak and the x near the end are similar.</div>
			<code>destroyOnComplete</code> <code>true</code> <div>By default the elements are removed when the animation is complete. Set to false to prevent this behaviour.</div>
		</div>
	</div>

	<div class="block">
		Made by <a href="https://github.com/Mitcheljager">Mitchel Jager</a>
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

	h3 {
		margin-top: 0;
	}

	code {
		display: block;
		margin-top: 1rem;
		color: var(--text-color-light);
		font-size: .75rem;
		line-height: 1.5em;
	}

	code.inline {
		display: inline;
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
		margin: 0.25rem 0;
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
		gap: 0 0.5rem;
	}

	.button-code-group {
		display: grid;
		grid-template-columns: 7rem auto;
		align-items: center;
		gap: 1rem;
		margin: 0.5rem 0;
	}

	.button-code-group button {
		width: 100%;
	}

	.button-code-group code {
		margin: 0;
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
