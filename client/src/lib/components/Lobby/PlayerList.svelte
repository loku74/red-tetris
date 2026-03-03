<script lang="ts">
  import { Crown, X } from "@lucide/svelte";

  import type { UserData } from "@app/shared";

  import Piece from "$lib/components/Piece.svelte";
  import UserColorPicker from "$lib/components/UserColorPicker.svelte";

  import { roomState } from "$lib/state/room.svelte";

  import { clickOutside } from "$lib/utils/clickOutside";
  import { isCurrentUser, isCurrentUserHost } from "$lib/utils/isCurrentUser";

  let {
    players,
    userHexColor,
    showColorChoice = $bindable(false),
    handleKickUser,
    handleColorChange
  }: {
    players: UserData[];
    userHexColor: string;
    showColorChoice: boolean;
    handleKickUser: (user: UserData) => void;
    handleColorChange: (color: UserData["color"]) => void;
  } = $props();
</script>

<ul class="py-6">
  {#each players as player, index (player.color)}
    <li
      class="p-2 text-lg flex items-center gap-2 group/list border-l-2 border-l-transparent
        {index % 2 === 0 ? 'bg-dark-accent/42' : ''}"
      style={isCurrentUser(player.username)
        ? `border-color: ${userHexColor}; color: ${userHexColor};`
        : "border-color: transparent;"}
    >
      <button
        onclick={() => {
          if (isCurrentUser(player.username)) {
            showColorChoice = true;
          }
        }}
        class={isCurrentUser(player.username)
          ? "piece-select hover-darken"
          : "border-2 border-transparent"}
      >
        <Piece color={player.color} size={24} />
      </button>
      <span class="overflow-hidden text-ellipsis">
        {player.username}
      </span>
      {#if roomState.data!.host === player.username}
        <Crown color="#FFC832" />
      {/if}

      <!-- kick button -->
      {#if isCurrentUserHost() && !isCurrentUser(player.username)}
        <button
          onclick={() => handleKickUser(player)}
          class="ml-auto btn btn-secondary group/button group-hover/list:opacity-100 opacity-0 duration-75 p-1"
          style="--btn-depth: 2px;"
        >
          <X size={20} class="group-hover/button:text-red-500 duration-100" />
        </button>
      {/if}
    </li>

    {#if showColorChoice && isCurrentUser(player.username)}
      <div class="absolute" use:clickOutside={() => (showColorChoice = false)}>
        <UserColorPicker onclick={handleColorChange}></UserColorPicker>
      </div>
    {/if}
  {/each}
</ul>
