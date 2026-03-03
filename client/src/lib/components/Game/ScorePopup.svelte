<script lang="ts">
  import type { GameScore } from "@app/shared";

  let { gameScore }: { gameScore: GameScore } = $props();
</script>

{#key gameScore}
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
{/key}

<style>
  @keyframes score-popup {
    0% {
      opacity: 0;
      transform: translateY(0);
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-42px);
    }
  }

  .animate-score-popup {
    animation: score-popup 1.2s ease-out forwards;
  }
</style>
