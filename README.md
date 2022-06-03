# Svelte Confetti

[![tests passing](https://github.com/MitchelJager/svelte-confetti/actions/workflows/node.js.yml/badge.svg)](https://github.com/Mitcheljager/svelte-confetti/actions/workflows/node.js.yml)
[![npm version](https://badgen.net/npm/v/svelte-confetti)](https://www.npmjs.com/package/svelte-confetti)
[![npm downloads](https://badgen.net/npm/dt/svelte-confetti)](https://www.npmjs.com/package/svelte-confetti)
[![bundle size](https://badgen.net/bundlephobia/minzip/svelte-confetti)](https://bundlephobia.com/package/svelte-confetti)

Add a little bit of flair to your app with some confetti 🎊! There are no dependencies and it's tiny in size. Even better; it works without JavaScript with the help of SSR in SvelteKit (this page doesn't use SSR though)!

**Demo and Docs**: https://mitcheljager.github.io/svelte-confetti/

### Installation

Install using Yarn or NPM.
```js
yarn add svelte-confetti
```
```js
npm install --save svelte-confetti
```

Include the component in your app.
```js
import { Confetti } from "svelte-confetti"
```
```svelte
<Confetti />
```

## Usage

For detailed documentation on every property check out: [https://mitcheljager.github.io/svelte-confetti/](https://mitcheljager.github.io/svelte-confetti/)

### Configuration

| Property | Default | Description |
--- | --- | ---
size | 10 | The max size in pixels of the individual confetti pieces.
x | [-0.5, 0.5] | The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.
y | [0.25, 1] | The max vertical range of the confetti pieces. Negative is down, positive is up. [-1, 1] would mean maximum of 200px down and 200px up.
duration | 2000 | Duration of the animation for each individual piece.
infinite | false | If set to true the animation will play indefinitely.
delay | [0, 50] | Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.
colorRange | [0, 360] | Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.
colorArray | [] | Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.
amount | 50 | Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.
iterationCount | 1 | How many times the animation will play before stopping. Is overwritten by the "infinite" property.
fallDistance | "100px" | How far each piece falls. Accepts any css property, px, rem, vh, etc, but not 0.
rounded | false | Set to true to make each confetti piece rounded.
cone | false | Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.
noGravity | false | Set to true to make the particles accelerate at a constant speed without "falling" down. Give it a more explosion like effect.
destroyOnComplete | true | By default the elements are removed when the animation is complete. Set to false to prevent this behaviour.
