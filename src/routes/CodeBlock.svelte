<script>
  let {
    svelte4,
    svelte5
  } = $props()

  const tabs = [
    "Svelte 4",
    "Svelte 5"
  ]

  let currentTab = $state("Svelte 5")
</script>

{#if svelte4 && svelte5}
  <strong class="tabs">
    {#each tabs as tab}
      <button class="tab" class:active={currentTab === tab} onclick={() => currentTab = tab}>{tab}</button>
    {/each}
  </strong>
{/if}

<p>
  <code class="well" class:has-tabs={svelte4 && svelte5}>
    {#if currentTab === "Svelte 4"}
      {@render svelte4?.()}
    {:else if currentTab === "Svelte 5"}
      {@render svelte5?.()}
    {/if}
  </code>
</p>

<style>
  .tabs {
    display: flex;
    gap: 0.25rem;
    margin: 0 0 -1.25rem 0.5rem;
  }

  .tab {
		appearance: none;
		-webkit-appearance: none;
		background: var(--bg-well);
		padding: 0.5rem 0.75rem;
		margin: 0.25rem 0;
    border-radius: 0.25rem 0.25rem 0 0;
		border: 1px solid var(--bg-well);
    border-bottom: 0;
    filter: brightness(0.8);
		font-size: 1rem;
    color: white;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
		transition: outline 100ms, transform 100ms;
	}

  .tab:hover {
    filter: brightness(1);
  }

  .tab.active {
    border-color: var(--border-color);
    filter: brightness(1);
    box-shadow: 0 5px 0 0 var(--bg-well);
	}

	.tab:focus-visible:not(:active) {
		outline: 3px solid var(--text-color-lightest);
	}

	.tab:active {
		transform: scale(0.95);
	}

  code {
		display: block;
		margin-top: 1rem;
		color: var(--text-color-light);
		font-size: .75rem;
		line-height: 1.5em;
	}

  .well {
    display: block;
		padding: .35rem .5rem;
		border-radius: .5rem;
		border: 1px solid var(--border-color);
		background: var(--bg-well);
	}
</style>
