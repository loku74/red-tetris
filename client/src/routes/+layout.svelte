<script lang="ts">
  import "./layout.css";
  import redPiece from "$lib/assets/red_piece.jpg";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={redPiece} />
</svelte:head>

{@render children()}
