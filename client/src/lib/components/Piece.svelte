<script lang="ts">
  import type { Piece } from "@app/shared";
  import { PIECE_COLORS } from "@app/shared";

  type PieceOptionalParams = {
    inline?: boolean;
    disabled?: boolean;
  };

  let { size, color, inline = false, disabled = false }: Piece & PieceOptionalParams = $props();

  const pieceColor = $derived(PIECE_COLORS[color]);
  const sizeValue = $derived(typeof size === "number" ? `${size}px` : size);
  const borderWidth = $derived(
    typeof size === "number" ? `${size * 0.125}px` : `calc(${size} * 0.125)`
  );

  const style = $derived(`
		width: ${sizeValue};
		height: ${sizeValue};
		background-color: ${pieceColor.main};
		border-width: ${borderWidth};
		border-style: solid;
		border-left-color: ${pieceColor.light};
		border-top-color: ${pieceColor.light};
		border-right-color: ${pieceColor.dark};
		border-bottom-color: ${pieceColor.dark};
		box-sizing: border-box;
		${inline ? "display: inline-block; vertical-align: text-top;" : ""}
		${disabled ? "opacity: 0.42;" : ""}
	`);
</script>

<div {style}></div>
