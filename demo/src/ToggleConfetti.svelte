<script>
  import { tick } from 'svelte'

  export let toggleOnce
  export let relative = true

  let active = false

  async function click() {
    if (toggleOnce) {
      active = !active
      return
    }

    active = false
    await tick();
    active = true
  }
</script>



<span on:click={click} class:relative>
  <slot name="label" />

  {#if active}
    <div class="confetti">
      <slot />
    </div>
  {/if}
</span>




<style>
  .relative {
    position: relative;
  }

  .relative .confetti {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(50%);
  }

  .confetti {
    pointer-events: none;
  }
</style>
