<script lang="ts">
  import { getAllUserColors, type UserColor } from "@app/shared";

  import { roomState } from "$lib/state/room.svelte";

  import Piece from "./Piece.svelte";

  type UserColorPickerProps = {
    onclick: (color: UserColor) => void;
  };

  const { onclick }: UserColorPickerProps = $props();

  let takenColors = $derived.by(() => {
    let takenColors: UserColor[] = [];

    if (roomState.data) {
      roomState.data.players.forEach((user) => {
        takenColors.push(user.color);
      });
    }

    return takenColors;
  });

  let allColors = getAllUserColors();
</script>

<div class="bg-dark-secondary border-2 border-border p-4 grid grid-cols-4 gap-4">
  {#each allColors as color (color)}
    <button
      disabled={takenColors.includes(color)}
      onclick={() => onclick(color)}
      class={!takenColors.includes(color) ? "piece-select" : ""}
    >
      <Piece {color} size={32} disabled={takenColors.includes(color)}></Piece>
    </button>
  {/each}
</div>

<style>
</style>
