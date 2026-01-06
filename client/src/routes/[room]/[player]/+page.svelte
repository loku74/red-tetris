<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  // components
  import Piece from "$lib/components/Piece.svelte";
  import { Crown, DoorOpen, LogOut, Swords, UserX, X } from "@lucide/svelte";
  import Dialog from "$lib/components/Dialog.svelte";

  // socket
  import { getSocket } from "$lib/socket";

  // types
  import type { SocketJoinRoomData, SocketKickData, SocketLeaveRoomData } from "$lib/types/socket";
  import type { SocketJoinRoomResponse, SocketRoomInfoData, SocketPlayerData } from "server-types";
  import type { PieceColor } from "$lib/types/piece";

  // utils
  import { USERNAME_MAX_LENGTH } from "$lib/constants";
  import { pieceColors } from "$lib/utils/piece";
  import { setKickedDialog, setKickedRoom } from "$lib/stores/kick.svelte";

  const room = page.params.room;
  const username = page.params.player;

  let roomData = $state<SocketRoomInfoData>();
  let roomError = $state<string>();
  let userError = $state<string>();
  let unusualError = $state<string>();

  let color = $state<string>();
  let joined = $state(false);
  let countdown = $state(5);

  let showKickDialog = $state(false);
  let userToKick = $state<string>();
  let userToKickColor = $state<PieceColor>("empty");
  let userToKickPieceColor = $state<string>("#e6e6e6");

  let showLeaveDialog = $state(false);

  const socket = getSocket();

  let errors = $derived([roomError, userError, unusualError].filter((e) => e));

  function joinRoom() {
    if (joined) return;

    localStorage.setItem("username", username?.substring(0, USERNAME_MAX_LENGTH)!);
    const data: SocketJoinRoomData = { username: username || "", room: room || "" };
    socket.emit(
      "join room",
      data,
      (success: boolean, data: SocketRoomInfoData | SocketJoinRoomResponse) => {
        if (!success) {
          const errorData = data as SocketJoinRoomResponse;
          roomError = errorData.roomName;
          userError = errorData.username;
          if (!userError && !roomError) {
            unusualError = "Failed to join room";
          }
          const interval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(interval);
              goto("/");
            }
          }, 1000);
        } else {
          roomData = data as SocketRoomInfoData;
          socket.on("room update", (data: SocketRoomInfoData) => {
            roomData = data;
          });
          const player = roomData.players.find((p) => p.username === username)!;
          color = pieceColors[player.color].light;
          joined = true;
        }
      }
    );
  }

  function leaveRoom() {
    const data: SocketLeaveRoomData = { room: room! };
    socket.emit("leave room", data, (success: boolean) => {
      if (success) {
        goto("/");
      }
    });
  }

  function handleKickUser(user: SocketPlayerData) {
    userToKick = user.username;
    userToKickColor = user.color;
    userToKickPieceColor = pieceColors[user.color].light;
    showKickDialog = true;
  }

  function kickUser(data: SocketKickData) {
    socket.emit("kick", data, (success: boolean) => {
      if (success) showKickDialog = false;
    });
  }

  onMount(() => {
    if (socket.connected) joinRoom();
    else socket.on("connect", joinRoom);

    // to change
    socket.on("kick", () => {
      setKickedRoom(room!);
      setKickedDialog(true);
      goto("/");
    });

    return () => {
      socket.off("connect", joinRoom);
    };
  });
</script>

<div class="flex h-screen items-center justify-center bg-dark-primary gap-32">
  {#if !joined}
    <div class="bg-dark-secondary px-8 py-4 ring-border ring">
      <div class="text-center">
        {#each errors as error}
          {#if error}
            <p class="text-red-400 text-xl mb-2">{error}</p>
            <p>Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...</p>
          {/if}
        {:else}
          <p class="text-white text-xl">Joining room "{room}" as "{username}"...</p>
        {/each}
      </div>
    </div>
  {:else if roomData}
    <div
      class="p-4 bg-dark-secondary ring ring-inset ring-border h-[640px] w-[360px] flex flex-col"
    >
      <h1 class="text-center text-red-primary overflow-hidden text-ellipsis text-3xl pb-2">
        {room}
      </h1>
      <span class="text-center text-xl">{roomData.userCount} / {roomData.max}</span>
      <ul class="py-4">
        {#each roomData.players as player, index (player.color)}
          <li
            class="text-white p-2 text-lg flex items-center gap-2 group/list {username ===
            player.username
              ? `border-l-2`
              : ''} {index % 2 === 0 ? 'bg-dark-list-accent' : ''}"
            style={username === player.username ? `border-color: ${color}; color: ${color};` : ""}
          >
            <Piece color={player.color} size={24} />
            <span class="overflow-hidden text-ellipsis">
              {player.username}
            </span>
            {#if roomData.host === player.username}
              <Crown color="#FFC832" />
            {/if}
            {#if roomData.host === username && player.username !== username}
              <button
                onclick={() => handleKickUser(player)}
                class="ml-auto btn btn-secondary group/button group-hover/list:opacity-100 opacity-0 duration-75 p-1"
                style="--btn-depth: 2px;"
              >
                <X size={20} class="group-hover/button:text-red-500 duration-100 text-white/90" />
              </button>
            {/if}
          </li>
        {/each}
      </ul>
      <div class="mt-auto space-y-4">
        {#if roomData.host === username}
          <button
            onclick={() => (showLeaveDialog = true)}
            class="btn btn-secondary text-lg py-1.5 w-full"
          >
            leave room
          </button>
        {:else}
          <p class="text-center text-white/70">Waiting for the host to start...</p>
        {/if}
        {#if roomData.host === username}
          <button
            class="btn btn-primary w-full text-3xl py-3 flex items-center justify-center gap-4"
            style="--btn-depth: 6px;"
          >
            START GAME
            <Swords size={32} />
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
    <div class="bg-dark-secondary ring ring-inset ring-border flex h-[640px] w-[320px]"></div>
  {/if}
</div>

{#if showKickDialog}
  <Dialog
    icon={UserX}
    confirm="kick"
    confirmCallback={() => kickUser({ username: userToKick!, room: room! })}
    title="Confirm kick"
    cancel="cancel"
    bind:open={showKickDialog}
  >
    <div class="flex">
      Do you want to kick
      <div class="flex items-center gap-2 px-2">
        <Piece color={userToKickColor} size={16} />
        <span style="color: {userToKickPieceColor}">
          {userToKick}
        </span>
      </div>
      from the room ?
    </div>
  </Dialog>
{/if}

<Dialog
  icon={DoorOpen}
  confirm="leave"
  confirmCallback={leaveRoom}
  title="Leave room"
  cancel="cancel"
  bind:open={showLeaveDialog}
>
  <p class="text-white/75">Are you sure you want to leave the room?</p>
</Dialog>
