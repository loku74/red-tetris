<script lang="ts">
  import { Swords } from "@lucide/svelte";

  import type { PlayerScore } from "@app/shared";

  import Dialog from "$lib/components/Dialog.svelte";
  import Piece from "$lib/components/Piece.svelte";

  import { getLightColor } from "$lib/utils/getLightColor";

  let {
    open = $bindable(false),
    scores
  }: {
    open: boolean;
    scores: PlayerScore[];
  } = $props();

  const maxScore = $derived(Math.max(...scores.map((s) => s.score)));

  function getRankClass(index: number): string {
    if (index === 0) return "bg-[#E7B903]/20 text-[#E7B903]";
    if (index === 1) return "bg-[#C0C0C0]/20 text-[#C0C0C0]";
    if (index === 2) return "bg-[#CD7F32]/20 text-[#CD7F32]";
    return "bg-dark-accent/42";
  }
</script>

<Dialog
  icon={Swords}
  confirm="ok"
  confirmCallback={() => (open = false)}
  title="Game Scoreboard"
  bind:open
>
  <table class="w-full">
    <thead>
      <tr class="text-white/40 text-xs uppercase tracking-widest border-b border-border">
        <th class="py-2 pl-8 text-center">#</th>
        <th class="py-2 px-4 text-left">Name</th>
        <th class="py-2 pr-8 text-right">Score</th>
      </tr>
    </thead>
    <tbody>
      {#each scores as score, index (score.name)}
        <tr>
          <td class="py-2 pl-8 w-8">
            <span class="{getRankClass(index)} rounded-xs w-6 h-6 flex items-center justify-center">
              {index + 1}
            </span>
          </td>
          <td class="py-2 px-4">
            <span class="flex items-center gap-2" style="color: {getLightColor(score.color)};">
              <Piece color={score.color} size={14} />
              {score.name}
            </span>
          </td>
          <td class="py-2 pr-8 text-right {score.score === maxScore ? 'text-red-accent' : ''}">
            {score.score}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</Dialog>
