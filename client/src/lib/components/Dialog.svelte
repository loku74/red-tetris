<script lang="ts">
  import { fade, scale } from "svelte/transition";

  let {
    open = $bindable(false),
    children
  }: {
    open: boolean;
    children: import("svelte").Snippet;
  } = $props();

  function handleBackdropClick() {
    open = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <button
      transition:fade={{ duration: 100 }}
      class="absolute inset-0 bg-black/70"
      onclick={handleBackdropClick}
      aria-label="Close dialog"
    ></button>

    <!-- Dialog content -->
    <div
      transition:scale={{ duration: 100, start: 0.8 }}
      class="relative bg-dark-primary ring-2 ring-inset ring-border p-8"
    >
      {@render children()}
    </div>
  </div>
{/if}
