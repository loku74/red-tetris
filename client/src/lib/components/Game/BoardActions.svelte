<script lang="ts">
  import { fade } from "svelte/transition";
  import { GamepadDirectional, RotateCcw } from "@lucide/svelte";

  import type { UserData } from "@app/shared";

  import Piece from "$lib/components/Piece.svelte";

  import { roomState } from "$lib/state/room.svelte";

  import { getLightColor } from "$lib/utils/getLightColor";

  let {
    game,
    warmUp,
    startWarmUp,
    spectatedPlayer = $bindable(),
    emitResetSpectate
  }: {
    game: boolean;
    warmUp: boolean;
    startWarmUp: () => void;
    spectatedPlayer?: UserData;
    emitResetSpectate: () => void;
  } = $props();

  const userData = $derived.by(() => {
    if (spectatedPlayer) return spectatedPlayer;
    return { username: roomState.username, color: roomState.color };
  });

  const userHexColor = $derived(getLightColor(userData.color));
</script>

{#if !game}
  <button
    in:fade={{ duration: 200 }}
    onclick={(e) => {
      e.currentTarget.blur();
      startWarmUp();
    }}
    class="btn btn-primary px-4 py-2 text-xl absolute right-1/2 translate-x-1/2 -bottom-20 flex items-center gap-2"
  >
    {#if warmUp}
      <RotateCcw />
      restart
    {:else}
      <GamepadDirectional />
      warmup
    {/if}
  </button>
{:else}
  <div class="absolute right-1/2 translate-x-1/2 -bottom-12">
    <div class="relative flex gap-2 items-center text-nowrap text-lg">
      {#if spectatedPlayer}
        SPECTATING:
      {/if}
      <Piece color={userData.color} size={20} />
      <span style="color: {userHexColor}">
        {userData.username}
      </span>
      {#if spectatedPlayer}
        <button
          class="absolute right-1/2 translate-x-1/2 -bottom-12 active:scale-95 duration-75 px-3 py-1 text-white/75 hover:bg-dark-accent/42 hover:text-white/90"
          onclick={emitResetSpectate}
        >
          Go to my game
        </button>
      {/if}
    </div>
  </div>
{/if}
