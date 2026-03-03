<script lang="ts">
  import type { GameData } from "@app/shared";
  import { PieceColor } from "@app/shared";

  import Piece from "$lib/components/Piece.svelte";

  let {
    nextPieces
  }: {
    nextPieces: GameData["nextPieces"];
  } = $props();
</script>

<div class="absolute top-0 -right-38 text-xl flex flex-col gap-2 items-center">
  <span>Next</span>

  <div class="border-2 border-border flex flex-col w-28 py-8 items-center gap-8">
    {#each nextPieces as piece, index (index)}
      <div>
        {#each piece.matrix as row, index_cell (index_cell)}
          <div class="flex">
            {#each row as cell, index_cell (index_cell)}
              {#if !row.some((cell) => cell)}
                <!-- do nothing if none of the cells are filled -->
              {:else if cell !== PieceColor.EMPTY}
                <Piece color={piece.color} size={20} />
              {:else}
                <div class="h-[20px] w-[20px]"></div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
