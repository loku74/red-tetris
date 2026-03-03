<script lang="ts">
  import type { Piece, UserColor } from "@app/shared";
  import { PIECE_COLORS, PieceColor } from "@app/shared";

  type PieceOptionalParams = {
    inline?: boolean;
    disabled?: boolean;
    spectrumColor?: UserColor;
  };

  let {
    size,
    color,
    inline = false,
    disabled = false,
    spectrumColor
  }: Piece & PieceOptionalParams = $props();

  const pieceColor = $derived(PIECE_COLORS[color]);
  const overrideColor = $derived.by(() => {
    if (spectrumColor) {
      if (color === PieceColor.EMPTY) return PIECE_COLORS[color].main;
      if (color === PieceColor.GREY) return PIECE_COLORS[color].dark;
      else return PIECE_COLORS[spectrumColor].main;
    }
    return null;
  });
  const sizeValue = $derived(typeof size === "number" ? `${size}px` : size);
  const borderWidth = $derived(
    typeof size === "number" ? `${size * 0.125}px` : `calc(${size} * 0.125)`
  );

  const style = $derived(`
		width: ${sizeValue};
		height: ${sizeValue};
		background-color: ${overrideColor ?? pieceColor.main};
		border-width: ${borderWidth};
		border-style: solid;
		border-left-color: ${overrideColor ?? pieceColor.light};
		border-top-color: ${overrideColor ?? pieceColor.light};
		border-right-color: ${overrideColor ?? pieceColor.dark};
		border-bottom-color: ${overrideColor ?? pieceColor.dark};
		box-sizing: border-box;
		${inline ? "display: inline-block; vertical-align: text-top;" : ""}
		${disabled ? "opacity: 0.42;" : ""}
	`);
</script>

<div {style}></div>
