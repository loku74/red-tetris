<script lang="ts">
  import type { Piece } from "$lib/types/piece";
  import { pieceColors } from "$lib/constants/pieceColors";

  let { size, color }: Piece = $props();

  const pieceColor = $derived(pieceColors[color]);
  const borderWidth = $derived(size * 0.125);
</script>

<div
  style="
		width: {size}px;
		height: {size}px;
		background-color: {pieceColor.main};
		border-width: {borderWidth}px;
		border-style: solid;
		border-left-color: {pieceColor.light};
		border-top-color: {pieceColor.light};
		border-right-color: {pieceColor.dark};
		border-bottom-color: {pieceColor.dark};
		box-sizing: border-box;
	"
></div>
