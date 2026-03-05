<script lang="ts">
  import { fade } from "svelte/transition";

  import type { GameScore, UserData } from "@app/shared";

  let {
    gameScore,
    dead,
    spectatedPlayer
  }: { gameScore?: GameScore; dead: boolean; spectatedPlayer?: UserData } = $props();
</script>

{#key gameScore}
  {#if gameScore}
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="flex flex-col items-center gap-1 animate-score-popup">
        <span class="text-red-accent text-sm uppercase tracking-widest">
          {gameScore.type}
        </span>
        <span class="text-red-accent text-2xl">
          +{gameScore.score}
        </span>
      </div>
    </div>
  {/if}
{/key}

{#if dead}
  <div
    in:fade={{ duration: 442 }}
    class="absolute inset-0 flex items-center justify-center pointer-events-none animate-dead-popup {spectatedPlayer
      ? 'opacity-0'
      : ''}"
  >
    <span class="text-red-accent text-4xl uppercase tracking-widest">you lose!</span>
  </div>
{/if}

<style>
  .animate-score-popup {
    animation: test-popup 1.2s ease-out forwards;
  }
</style>
