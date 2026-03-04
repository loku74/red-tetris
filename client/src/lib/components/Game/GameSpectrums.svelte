<script lang="ts">
  import type { PlayerInfo, UserData } from "@app/shared";

  import Board from "$lib/components/Game/Board.svelte";

  import { getLightColor } from "$lib/utils/getLightColor";

  let {
    spectrums,
    spectatedPlayer,
    dead,
    onSpectate
  }: {
    spectrums: PlayerInfo[];
    spectatedPlayer?: UserData;
    dead: boolean;
    onSpectate: (name: string) => void;
  } = $props();
</script>

<div class="absolute top-0 -left-36 flex flex-col justify-around h-full w-28">
  {#each spectrums as spectrum (spectrum.name)}
    <div class="flex flex-col gap-2 items-center">
      <button
        disabled={!spectrum.alive}
        onclick={() => onSpectate(spectrum.name)}
        class="{!spectrum.alive ? 'opacity-42 ' : ''}
        {spectatedPlayer?.username !== spectrum.name ? 'border border-border' : ''}
        {dead && spectrum.alive ? 'hover:brightness-125' : ''}
        border-2 w-fit"
        style={spectatedPlayer?.username === spectrum.name
          ? "border-color: " + getLightColor(spectrum.color)
          : ""}
      >
        <Board matrix={spectrum.matrix} pieceSize={8} spectrumColor={spectrum.color} />
      </button>
      <span
        class="text-xs w-full truncate text-center"
        style="color: {getLightColor(spectrum.color)}"
      >
        {spectrum.name}
      </span>
    </div>
  {/each}
</div>
