<script lang="ts">
  import { LogOut, Settings } from "@lucide/svelte";

  import type { EventMessageData, UserColor, UserData } from "@app/shared";
  import { GAME_MIN_PLAYERS } from "@app/shared";

  import MessageList from "$lib/components/Lobby/MessageList.svelte";
  import PlayerList from "$lib/components/Lobby/PlayerList.svelte";

  import { roomState } from "$lib/state/room.svelte";

  import { getLightColor } from "$lib/utils/getLightColor";
  import { isCurrentUserHost } from "$lib/utils/isCurrentUser";

  let {
    showLeaveDialog = $bindable(false),
    showSettings = $bindable(false),
    handleKickUser,
    onColorChange,
    startGame,
    messages,
    messageInputFocused = $bindable(false),
    onSendMessage
  }: {
    showLeaveDialog: boolean;
    showSettings: boolean;
    handleKickUser: (user: UserData) => void;
    onColorChange: (color: UserColor) => Promise<boolean>;
    startGame: () => void;
    messages: Array<EventMessageData>;
    messageInputFocused: boolean;
    onSendMessage: (message: string) => Promise<boolean>;
  } = $props();

  let userHexColor = $derived(getLightColor(roomState.color));
  let showColorChoice = $state(false);
  let message = $state("");

  async function handleColorChange(color: UserColor) {
    const success = await onColorChange(color);
    if (success) {
      showColorChoice = false;
    }
  }

  async function sendMessage() {
    if (message.trim()) {
      const success = await onSendMessage(message);
      if (success) {
        message = "";
      }
    }
  }
</script>

{#if roomState.data}
  <div class="h-[640px] flex">
    <div class="p-4 bg-dark-secondary border border-border w-[360px] h-full flex flex-col">
      <h1
        class="text-center text-red-primary overflow-hidden text-ellipsis text-3xl relative
          {isCurrentUserHost() ? 'px-8' : ''}"
      >
        {roomState.room}
        {#if isCurrentUserHost()}
          <button
            onclick={() => (showSettings = true)}
            class="absolute right-0 top-1/2 -translate-y-1/2 text-white/42 hover:text-white/74 hover:bg-dark-accent duration-100 p-1 rounded-xs"
          >
            <Settings />
          </button>
        {/if}
      </h1>
      <span class="py-2 text-center text-xl">
        {roomState.data.userCount} / {roomState.data.max}
      </span>

      <!-- PLAYER LIST -->
      <PlayerList
        players={roomState.data.players}
        {userHexColor}
        bind:showColorChoice
        {handleKickUser}
        {handleColorChange}
      />
      <div class="mt-auto space-y-4">
        {#if isCurrentUserHost()}
          <button
            onclick={() => (showLeaveDialog = true)}
            class="btn btn-secondary text-lg py-1.5 w-full"
          >
            leave room
          </button>
        {:else}
          <p class="text-center text-white/70">Waiting for the host to start...</p>
        {/if}
        {#if isCurrentUserHost()}
          <button
            disabled={roomState.data.players.length < GAME_MIN_PLAYERS}
            onclick={startGame}
            class="btn btn-primary w-full text-3xl py-3 flex items-center justify-center gap-4"
            style="--btn-depth: 6px;"
          >
            START GAME
          </button>
        {:else}
          <button
            onclick={() => (showLeaveDialog = true)}
            class="btn btn-primary w-full text-3xl py-3 flex items-center justify-center gap-4"
            style="--btn-depth: 6px;"
          >
            EXIT ROOM
            <LogOut size={32} />
          </button>
        {/if}
      </div>
    </div>

    <!-- message -->
    <MessageList {messages} bind:message bind:messageInputFocused {sendMessage} />
  </div>
{/if}
