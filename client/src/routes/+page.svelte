<script lang="ts">
  import { onMount } from "svelte";
  import { Gamepad2, Info, Radio } from "@lucide/svelte";

  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  import type { EventJoinRoomPayload, RoomListData } from "@app/shared";
  import {
    EVENT_GET_ROOMS,
    EVENT_JOIN_ROOM,
    PieceColor,
    REGEX_ROOM_AND_USER_SANITIZE,
    ROOM_MAX_LENGTH,
    USERNAME_MAX_LENGTH
  } from "@app/shared";

  import Dialog from "$lib/components/Dialog.svelte";
  import Piece from "$lib/components/Piece.svelte";
  import TextInput from "$lib/components/TextInput.svelte";

  import { kickState } from "$lib/state/kick.svelte";
  import { roomState } from "$lib/state/room.svelte";

  import bgTile from "$lib/assets/empty_piece.jpg";
  import { getSocket } from "$lib/socket/socket.svelte";

  const lobbyPieceSize = 52;

  // error
  let usernameError = $state<string>();
  let roomError = $state<string>();

  // socket
  const socket = getSocket();

  // join room
  let username = $state("");
  let room = $state("");
  let roomInput = $state<HTMLInputElement>();
  let emitting = $state(false);

  function joinRoom() {
    emitting = true;
    localStorage.setItem("username", username);
    const data: EventJoinRoomPayload = { username, room };
    socket.emit(EVENT_JOIN_ROOM, data, (response) => {
      if (!response.success) {
        usernameError = response.error.username;
        roomError = response.error.room;
        emitting = false;
      } else {
        roomState.joined = true;
        roomState.color = response.data.color;

        goto(
          resolve("/[room]/[username]", {
            room: data.room,
            username: data.username
          })
        );
      }
    });
  }

  function joinSelectedRoom(selectedRoom: string) {
    room = selectedRoom;
    showRoomsDialog = false;
    joinRoom();
  }

  // get rooms
  let rooms = $state<RoomListData[]>([]);
  let showRoomsDialog = $state(false);

  function getRooms() {
    socket.emit(EVENT_GET_ROOMS, (response) => {
      if (response.success) rooms = response.data;
    });
  }

  $effect(() => {
    if (showRoomsDialog) {
      getRooms();
      const interval = setInterval(getRooms, 1000);
      return () => clearInterval(interval);
    }
  });

  onMount(() => {
    username = localStorage.getItem("username")?.slice(0, USERNAME_MAX_LENGTH) ?? "";
  });
</script>

<div class="flex h-screen" style="background-image: url({bgTile});">
  <div class="m-auto flex flex-col">
    <div
      class="bg-dark-primary ring-2 ring-inset ring-border py-8 px-12 flex flex-col items-center relative mb-8 gap-8"
    >
      <h1
        class="py-2 text-6xl text-red-primary text-shadow-red-secondary text-shadow-[4px_4px_4px] text-center relative flex items-center gap-5"
      >
        RED
        <Piece color={PieceColor.RED} size={32} />
        TETRIS
      </h1>

      <div class="space-y-2">
        <TextInput
          bind:value={username}
          maxlength={USERNAME_MAX_LENGTH}
          placeholder="Enter username..."
          error={usernameError}
          onEnter={() => {
            roomInput?.focus();
          }}
          regex={REGEX_ROOM_AND_USER_SANITIZE}
          label="Username"
        />
        <TextInput
          bind:value={room}
          bind:input={roomInput}
          maxlength={ROOM_MAX_LENGTH}
          placeholder="Enter room name..."
          error={roomError}
          onEnter={() => {
            joinRoom();
          }}
          regex={REGEX_ROOM_AND_USER_SANITIZE}
          label="Room Name"
        />
      </div>
      <div class="flex flex-col space-y-4 w-xs">
        <button
          disabled={emitting}
          onclick={joinRoom}
          class="btn btn-primary text-3xl py-4"
          style="--btn-depth: 6px;"
        >
          join game
        </button>
        <button
          disabled={emitting}
          onclick={() => {
            showRoomsDialog = true;
          }}
          class="hover:bg-dark-secondary w-fit mx-auto px-4 py-2 text-white/75 not-disabled:active:scale-95 duration-75 disabled:text-white/50"
        >
          Show existing room(s)
        </button>
      </div>
      <div class="text-white/42 text-xs">
        Made by <a
          class="hover:text-red-accent hover:underline"
          href="https://github.com/ethaaalpha"
          target="_blank"
        >
          @ethaaalpha
        </a>
        and
        <a
          class="hover:text-red-accent hover:underline"
          href="https://github.com/loku74"
          target="_blank"
        >
          @loku74
        </a>
      </div>
      <div class="absolute grid grid-cols-2 top-0" style="left: {-lobbyPieceSize * 2}px;">
        <Piece color={PieceColor.YELLOW} size={lobbyPieceSize} />
        <Piece color={PieceColor.YELLOW} size={lobbyPieceSize} />
        <Piece color={PieceColor.YELLOW} size={lobbyPieceSize} />
        <Piece color={PieceColor.YELLOW} size={lobbyPieceSize} />
      </div>

      <div class="absolute flex" style="top: {-lobbyPieceSize}px; left: {-lobbyPieceSize}px;">
        <Piece color={PieceColor.CYAN} size={lobbyPieceSize} />
        <Piece color={PieceColor.CYAN} size={lobbyPieceSize} />
        <Piece color={PieceColor.CYAN} size={lobbyPieceSize} />
        <Piece color={PieceColor.CYAN} size={lobbyPieceSize} />
      </div>

      <div class="absolute flex" style="top: {-lobbyPieceSize}px; right: {-lobbyPieceSize}px;">
        <div>
          <Piece color={PieceColor.ORANGE} size={lobbyPieceSize} />
        </div>
        <div>
          <Piece color={PieceColor.ORANGE} size={lobbyPieceSize} />
          <Piece color={PieceColor.ORANGE} size={lobbyPieceSize} />
          <Piece color={PieceColor.ORANGE} size={lobbyPieceSize} />
        </div>
      </div>

      <div
        class="absolute flex"
        style="right: {-lobbyPieceSize * 2}px; bottom: {-lobbyPieceSize}px;"
      >
        <Piece color={PieceColor.PURPLE} size={lobbyPieceSize} />
        <Piece color={PieceColor.PURPLE} size={lobbyPieceSize} />
        <Piece color={PieceColor.PURPLE} size={lobbyPieceSize} />
      </div>
      <div class="absolute bottom-0 flex" style="right: {-lobbyPieceSize}px;">
        <Piece color={PieceColor.PURPLE} size={lobbyPieceSize} />
      </div>

      <div
        class="absolute flex flex-col"
        style="bottom: {-lobbyPieceSize}px; left: {-lobbyPieceSize}px;"
      >
        <Piece color={PieceColor.GREEN} size={lobbyPieceSize} />
        <Piece color={PieceColor.GREEN} size={lobbyPieceSize} />
      </div>
      <div class="absolute left-0 flex flex-col" style="bottom: {-lobbyPieceSize * 2}px; ">
        <Piece color={PieceColor.GREEN} size={lobbyPieceSize} />
        <Piece color={PieceColor.GREEN} size={lobbyPieceSize} />
      </div>
    </div>
  </div>

  <Dialog icon={Gamepad2} confirm="exit" title="Existing Rooms" bind:open={showRoomsDialog}>
    {#if rooms.length === 0}
      <p class="text-white/50 text-center">No rooms available</p>
    {:else}
      <ul class="space-y-2 px-16 max-h-128 overflow-y-auto w-full">
        {#each rooms as room (room.name)}
          <li>
            <button
              disabled={room.playing}
              onclick={() => joinSelectedRoom(room.name)}
              class="w-full text-left px-4 py-3 bg-dark-secondary hover:bg-dark-accent border border-border transition-colors duration-75 flex justify-between items-center {room.playing
                ? 'pointer-events-none opacity-50'
                : ''}"
            >
              <span class="overflow-hidden text-ellipsis">{room.name}</span>
              {#if room.playing}
                <span class="text-red-primary ml-auto px-3">
                  <Radio />
                </span>
              {/if}
              <span
                class="{room.userCount === room.max ? 'text-red-400' : 'text-white/50'} text-sm"
              >
                {room.userCount}/{room.max}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </Dialog>
</div>

<Dialog bind:open={kickState.show} icon={Info} confirm="ok" title="You have been kicked">
  <p class="text-white/75">
    You have been kicked from <span class="text-red-accent">{kickState.room}</span>
  </p>
</Dialog>
