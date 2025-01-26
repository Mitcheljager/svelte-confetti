<script>
  import { onMount } from "svelte"

  /**
   * @typedef {Object} Props
   * @property {number} [size] The maximum size of each confetti piece, each piece will randomly be given a size up to this number
   * @property {[number, number]} [x] The X multipliers of the distance between which the pieces will fly horizontally
   * @property {[number, number]} [y] The X multipliers of the distance between which the pieces will fly vertically
   * @property {number} [duration] The total duration of the animation in milliseconds
   * @property {boolean} [infinite] Whether the effect should loop infinitely
   * @property {[number, number]} [delay] Range of random delay between two values, in milliseconds, which will be randomly given to each piece
   * @property {[number, number]} [colorRange] Hue color range between which the confetti will be colored
   * @property {string[]} [colorArray] An array of colors in any valid CSS value, colors will be asigned to each piece randomly from this array
   * @property {number} [amount] The amount of confetti pieces in total, high numbers might lead to performance issues
   * @property {number | "infinite" | "initial" | "inherit"} [iterationCount] The number of times the animation will fire, allows any value valid for the css prop `animation-iteration-count`
   * @property {string} [fallDistance] The distance elements fall, represented as a css value such as "10px" or "5rem"
   * @property {boolean} [rounded] Whether the confetti pieces should have rounded edges
   * @property {boolean} [cone] If the effect should be shaped like a cone
   * @property {boolean} [noGravity] Whether gravity should be disabled for the effect
   * @property {number} [xSpread] The horizontal spread of the effect as it falls down, from 0 to 1
   * @property {boolean} [destroyOnComplete] Whether to destroy the elements after the animation is complete
   * @property {boolean} [disableForReducedMotion] Disable the effect if reduced motion is enabled
   */

  /** @type {Props} */
  const {
    size = 10,
    x = [-0.5, 0.5],
    y = [0.25, 1],
    duration = 2000,
    infinite = false,
    delay = [0, 50],
    colorRange = [0, 360],
    colorArray = [],
    amount = 50,
    iterationCount = 1,
    fallDistance = "100px",
    rounded = false,
    cone = false,
    noGravity = false,
    xSpread = 0.15,
    destroyOnComplete = true,
    disableForReducedMotion = false
  } = $props()

  let complete = $state(false)

  onMount(() => {
    if (!destroyOnComplete || infinite || typeof iterationCount === "string") return

    setTimeout(() => complete = true, (duration + delay[1]) * iterationCount)
  })

  /**
	 * @param {number} min
	 * @param {number} max
   * @returns {number}
	 */
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min
  }

  /** @returns {string} */
  function getColor() {
    if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))]
    else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%)`
  }
</script>

{#if !complete}
  <div class="confetti-holder" class:rounded class:cone class:no-gravity={noGravity} class:reduced-motion={disableForReducedMotion}>
    {#each { length: amount } as _}
      <div
        class="confetti"
        style="
        --fall-distance: {fallDistance};
        --size: {size}px;
        --color: {getColor()};
        --skew: {randomBetween(-45, 45)}deg,{randomBetween(-45, 45)}deg;
        --rotation-xyz: {randomBetween(-10, 10)}, {randomBetween(-10, 10)}, {randomBetween(-10, 10)};
        --rotation-deg: {randomBetween(0, 360)}deg;
        --translate-y-multiplier: {randomBetween(y[0], y[1])};
        --translate-x-multiplier: {randomBetween(x[0], x[1])};
        --scale: {0.1 * randomBetween(2, 10)};
        --transition-duration: {infinite ? `calc(${duration}ms * var(--scale))` : `${duration}ms`};
        --transition-delay: {randomBetween(delay[0], delay[1])}ms;
        --transition-iteration-count: {infinite ? "infinite" : iterationCount};
        --x-spread: {(1 - xSpread)}"></div>
    {/each}
  </div>
{/if}

<style>
  .confetti-holder {
    position: relative;
  }

  @keyframes rotate {
    0% {
      transform: skew(var(--skew)) rotate3d(var(--full-rotation));
    }

    100% {
      transform: skew(var(--skew)) rotate3d(var(--rotation-xyz), calc(var(--rotation-deg) + 360deg));
    }
  }

  @keyframes translate {
    0% {
      opacity: 1;
    }

    8% {
      transform: translateY(calc(var(--translate-y) * 0.95)) translateX(calc(var(--translate-x) * (var(--x-spread) * 0.9)));
      opacity: 1;
    }

    12% {
      transform: translateY(var(--translate-y)) translateX(calc(var(--translate-x) * (var(--x-spread) * 0.95)));
      opacity: 1;
    }

    16% {
      transform: translateY(var(--translate-y)) translateX(calc(var(--translate-x) * var(--x-spread)));
      opacity: 1;
    }

    100% {
      transform: translateY(calc(var(--translate-y) + var(--fall-distance))) translateX(var(--translate-x));
      opacity: 0;
    }
  }

  @keyframes no-gravity-translate {
    0% {
      opacity: 1;
    }

    100% {
      transform: translateY(var(--translate-y)) translateX(var(--translate-x));
      opacity: 0;
    }
  }

  .confetti {
    --translate-y: calc(-200px * var(--translate-y-multiplier));
    --translate-x: calc(200px * var(--translate-x-multiplier));
    position: absolute;
    height: calc(var(--size) * var(--scale));
    width: calc(var(--size) * var(--scale));
    animation: translate var(--transition-duration) var(--transition-delay) var(--transition-iteration-count) linear;
    opacity: 0;
    pointer-events: none;
  }

  .confetti::before {
    --full-rotation: var(--rotation-xyz), var(--rotation-deg);
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: var(--color);
    background-size: contain;
    transform: skew(var(--skew)) rotate3d(var(--full-rotation));
    animation: rotate var(--transition-duration) var(--transition-delay) var(--transition-iteration-count) linear;
  }

  .rounded .confetti::before {
    border-radius: 50%;
  }

  .cone .confetti {
    --translate-x: calc(200px * var(--translate-y-multiplier) * var(--translate-x-multiplier));
  }

  .no-gravity .confetti {
    animation-name: no-gravity-translate;
    animation-timing-function: ease-out;
  }

  @media (prefers-reduced-motion) {
    .reduced-motion .confetti,
    .reduced-motion .confetti::before {
      animation: none;
    }
  }
</style>
