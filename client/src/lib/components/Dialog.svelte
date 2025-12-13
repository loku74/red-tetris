<script lang="ts">
  import { fade, scale } from "svelte/transition";

  // types
  import type { Snippet, Component } from "svelte";

  let {
    open = $bindable(false),
    icon: IconCmp,
    title,
    confirm = "ok",
    confirmCallback = () => {},
    cancel = null,
    children
  }: {
    open: boolean;
    icon: Component;
    title: string;
    confirm?: string;
    confirmCallback?: () => void;
    cancel?: string | null;
    children: Snippet;
  } = $props();

  function closeDialog() {
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
      onclick={closeDialog}
      aria-label="Close dialog"
    ></button>

    <!-- Dialog content -->
    <div
      transition:scale={{ duration: 100, start: 0.8 }}
      class="relative bg-dark-primary ring-2 ring-inset ring-border p-6 w-lg flex flex-col items-center"
    >
      <!-- Top section -->
      <div class="flex items-center justify-center pb-2">
        <IconCmp size={32} />
      </div>
      <h1 class="text-center text-2xl mb-4">{title}</h1>

      {@render children()}

      <!-- Bottom section -->
      <div class="flex items-center justify-center gap-6 mt-6">
        <button
          class="btn btn-primary text-xl min-w-24 py-2 px-4"
          onclick={() => {
            closeDialog();
            confirmCallback();
          }}
        >
          {confirm}
        </button>
        {#if cancel}
          <button class="btn btn-secondary text-xl min-w-16 py-2 px-4" onclick={closeDialog}>
            {cancel}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
