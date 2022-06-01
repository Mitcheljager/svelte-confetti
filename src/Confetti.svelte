<script>
  export let size = 10
  export let xMultiplier = [-1, 1]
  export let yMultiplier = [0.25, 1]
  export let duration = 2000
  export let infinite = false
  export let delay = [0, 50]
  export let colorRange = [0, 360]
  export let colorArray = []
  export let amount = 100
  export let iterationCount = 1
  export let fallDistance = 200

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min
  }

  function getColor() {
    if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))]
    else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%`
  }
</script>



<div class="confetti-holder">
  {#each { length: amount } as _}
    <div
      class="confetti"
      style="
      --fall-distance: {fallDistance}px;
      --size: {size}px;
      --color: {getColor()};
      --skew: {randomBetween(-45, 45)}deg,{randomBetween(-45, 45)}deg;
      --rotation-xyz: {randomBetween(-10, 10)}, {randomBetween(-10, 10)}, {randomBetween(-10, 10)};
      --rotation-deg: {randomBetween(0, 360)}deg;
      --translate-y-multiplier: {randomBetween(yMultiplier[0], yMultiplier[1])};
      --translate-x-multiplier: {randomBetween(xMultiplier[0], xMultiplier[1])};
      --scale: {0.1 * randomBetween(2, 10)};
      --transition-duration: {infinite ? `calc(${duration}ms * var(--scale))` : `${duration}ms`};
      --transition-delay: {randomBetween(delay[0], delay[1])}ms;
      --transition-iteration-count: {infinite ? 'infinite' : iterationCount};" />
  {/each}
</div>



<style>
  .confetti-holder {
    display: inline-block;
    position: relative;
  }

  @keyframes rotate {
    0% {
      transform: skew(var(--skew)) rotate3d(var(--full-rotation));
    }

    100% {
      transform: skew(var(--skew))
        rotate3d(var(--rotation-xyz), calc(var(--rotation-deg) + 360deg));
    }
  }

  @keyframes translate {
    0% {
      opacity: 1;
    }

    8% {
      transform: translateY(calc(var(--translate-y) * 0.95))
        translateX(calc(var(--translate-x) * 0.8));
      opacity: 1;
    }

    12% {
      transform: translateY(var(--translate-y))
        translateX(calc(var(--translate-x) * 0.85));
      opacity: 1;
    }

    17% {
      transform: translateY(var(--translate-y))
        translateX(calc(var(--translate-x) * 0.87));
      opacity: 1;
    }

    100% {
      transform: translateY(calc(var(--translate-y) + var(--fall-distance)))
        translateX(var(--translate-x));
      opacity: 0;
    }
  }

  .confetti {
    --translate-y: calc(-200px * var(--translate-y-multiplier));
    --translate-x: calc(
      200px * var(--translate-y-multiplier) * var(--translate-x-multiplier)
    );
    position: absolute;
    height: calc(var(--size) * var(--scale));
    width: calc(var(--size) * var(--scale));
    animation: translate var(--transition-duration) var(--transition-delay)
      var(--transition-iteration-count) linear;
    opacity: 0;
  }

  .confetti::before {
    --full-rotation: var(--rotation-xyz), var(--rotation-deg);
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: var(--color);
    transform: skew(var(--skew)) rotate3d(var(--full-rotation));
    animation: rotate var(--transition-duration) var(--transition-delay)
      var(--transition-iteration-count) linear;
  }
</style>
