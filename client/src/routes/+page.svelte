<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // assets
  import bgTile from "$lib/assets/empty_piece.jpg";

  // components
  import Dialog from "$lib/components/Dialog.svelte";
  import Piece from "$lib/components/Piece.svelte";
  import TextInput from "$lib/components/TextInput.svelte";
  import { Gamepad2, Info } from "@lucide/svelte";

  // stores
  import { kickState, setKickedDialog } from "$lib/stores/kick.svelte";

  // socket
  import { getSocket } from "$lib/socket";

  // events
  import { EVENT_CAN_JOIN_ROOM, EVENT_GET_ROOMS, EVENT_JOIN_ROOM } from "server-events";

  // types
  import type { SocketJoinRoomData } from "$lib/types/socket";
  import type { SocketJoinRoomResponse, SocketGetRoomsResponse } from "server-types";

  // constants
  import { USERNAME_MAX_LENGTH, ROOM_NAME_MAX_LENGTH } from "$lib/constants/max";
  import { REGEX_USER_AND_ROOM } from "$lib/constants/regex";

  // error
  let usernameError = $state<string>();
  let roomError = $state<string>();

  // socket
  const socket = getSocket();

  // join room
  let username = $state("");
  let room = $state("");
  let roomNameInput = $state<HTMLInputElement>();
  let emitting = $state(false);

  function canJoinRoom() {
    emitting = true;
    localStorage.setItem("username", username);
    const data: SocketJoinRoomData = { username: username || "", roomName: room || "" };
    socket.emit(EVENT_CAN_JOIN_ROOM, data, (success: boolean, data: SocketJoinRoomResponse) => {
      if (!success) {
        usernameError = data.username;
        roomError = data.roomName;
        emitting = false;
      } else {
        goto(`/${data.roomName}/${data.username}`);
      }
    });
  }

  function joinSelectedRoom(selectedRoom: string) {
    room = selectedRoom;
    showRoomsDialog = false;
    canJoinRoom();
  }

  // get rooms
  let rooms = $state<SocketGetRoomsResponse[]>([]);
  let showRoomsDialog = $state(false);

  function getRooms() {
    socket.emit(EVENT_GET_ROOMS, (success: boolean, data: SocketGetRoomsResponse[]) => {
      if (success) rooms = data;
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
    <h1
      class="text-7xl text-red-primary text-shadow-red-secondary text-shadow-[8px_6px_0px] text-center mb-32 relative"
    >
      RED TETRIS
      <div class="absolute top-1/2 -translate-y-1/2 -left-24">
        <Piece color="red" size={64} />
      </div>
      <div class="absolute top-1/2 -translate-y-1/2 -right-24">
        <Piece color="red" size={64} />
      </div>
    </h1>
    <div
      class="bg-dark-primary ring-2 ring-inset ring-border p-8 flex flex-col items-center relative mb-24"
    >
      <div class="space-y-4">
        <TextInput
          bind:value={username}
          maxlength={USERNAME_MAX_LENGTH}
          placeholder="Username"
          error={usernameError}
          onEnter={() => {
            roomNameInput?.focus();
          }}
          regex={REGEX_USER_AND_ROOM}
        />
        <TextInput
          bind:value={room}
          bind:input={roomNameInput}
          maxlength={ROOM_NAME_MAX_LENGTH}
          placeholder="Room Name"
          error={roomError}
          onEnter={() => {
            canJoinRoom();
          }}
          regex={REGEX_USER_AND_ROOM}
        />
      </div>
      <div class="pt-8 flex flex-col space-y-4 w-xs">
        <button
          disabled={emitting}
          onclick={canJoinRoom}
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
      <div class="absolute grid grid-cols-2 -left-32 top-0">
        <Piece color="yellow" size={64} />
        <Piece color="yellow" size={64} />
        <Piece color="yellow" size={64} />
        <Piece color="yellow" size={64} />
      </div>

      <div class="absolute flex -top-16 -left-16">
        <Piece color="cyan" size={64} />
        <Piece color="cyan" size={64} />
        <Piece color="cyan" size={64} />
        <Piece color="cyan" size={64} />
      </div>

      <div class="absolute -top-16 -right-16 flex">
        <div>
          <Piece color="orange" size={64} />
        </div>
        <div>
          <Piece color="orange" size={64} />
          <Piece color="orange" size={64} />
          <Piece color="orange" size={64} />
        </div>
      </div>

      <div class="absolute -bottom-16 -right-32 flex">
        <Piece color="purple" size={64} />
        <Piece color="purple" size={64} />
        <Piece color="purple" size={64} />
      </div>
      <div class="absolute bottom-0 -right-16 flex">
        <Piece color="purple" size={64} />
      </div>

      <div class="absolute -bottom-16 -left-16 flex flex-col">
        <Piece color="green" size={64} />
        <Piece color="green" size={64} />
      </div>
      <div class="absolute -bottom-32 left-0 flex flex-col">
        <Piece color="green" size={64} />
        <Piece color="green" size={64} />
      </div>
    </div>
  </div>

  <Dialog icon={Gamepad2} confirm="exit" title="Available Rooms" bind:open={showRoomsDialog}>
    {#if rooms.length === 0}
      <p class="text-white/50 text-center">No rooms available</p>
    {:else}
      <ul class="space-y-2 px-4 max-h-128 overflow-y-auto w-80">
        {#each rooms as { name, userCount, max }}
          <li>
            <button
              onclick={() => joinSelectedRoom(name)}
              class="w-full text-left px-4 py-3 bg-dark-secondary hover:bg-dark-accent border border-border transition-colors duration-75 flex justify-between items-center"
            >
              <span>{name}</span>
              <span class="{userCount === max ? 'text-red-400' : 'text-white/50'} text-sm">
                {userCount}/{max}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </Dialog>
</div>

<Dialog
  icon={Info}
  confirm="ok"
  title="You have been kicked"
  open={kickState.show}
  confirmCallback={() => setKickedDialog(false)}
  onclose={() => setKickedDialog(false)}
>
  <p class="text-white/75">
    You have been kicked from <span class="text-red-accent">{kickState.room}</span>
  </p>
</Dialog>
