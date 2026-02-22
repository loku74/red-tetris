<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import {
    Crown,
    DoorOpen,
    GamepadDirectional,
    LogOut,
    RotateCcw,
    Send,
    UserX,
    X
  } from "@lucide/svelte";

  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import type {
    EventJoinRoomPayload,
    EventKickData,
    EventKickPayload,
    EventMessageData,
    EventMessagePayload,
    GameData,
    GameSettings,
    UserData
  } from "@app/shared";
  import {
    Colors,
    EVENT_JOIN_ROOM,
    EVENT_KICK,
    EVENT_LEAVE_ROOM,
    EVENT_MESSAGE,
    EVENT_WARMUP_ACTION,
    EVENT_WARMUP_FINISH,
    EVENT_WARMUP_INFO,
    EVENT_WARMUP_START,
    GameActions,
    MESSAGE_MAX_LENGTH,
    pieceColors,
    REGEX_MESSAGE_SANITIZE,
    USERNAME_MAX_LENGTH
  } from "@app/shared";

  import Dialog from "$lib/components/Dialog.svelte";
  import Piece from "$lib/components/Piece.svelte";
  import TextInput from "$lib/components/TextInput.svelte";

  import { kickState } from "$lib/state/kick.svelte";
  import { roomState } from "$lib/state/room.svelte";

  import { getSocket } from "$lib/socket/socket.svelte";

  // url params
  let room = $state(page.params.room || "");
  let username = $state(page.params.username || "");

  // errors
  let roomError = $state<string>();
  let userError = $state<string>();
  let unusualError = $state<string>();
  let countdown = $state(5);

  let errors = $derived([roomError, userError, unusualError].filter((e) => e));

  // socket
  const socket = getSocket();

  // color
  let userColor = $state<string>(getColor(roomState.color));

  // matrix
  let gameData = $state<GameData>();

  function getColor(color: Colors) {
    return pieceColors[color].light;
  }

  // check if a cell is part of the shadow piece
  function isShadowCell(data: GameData, rowIndex: number, cellIndex: number): boolean {
    const { blocks } = data.shadowPiece;

    for (const block of blocks) {
      if (block[0] === rowIndex && block[1] === cellIndex) {
        return true;
      }
    }
    return false;
  }

  function joinRoom() {
    const data: EventJoinRoomPayload = { username, room };
    socket.emit(EVENT_JOIN_ROOM, data, (response) => {
      if (!response.success) {
        roomError = response.error.room;
        userError = response.error.username;
        if (!userError && !roomError) unusualError = "Failed to join room";

        const interval = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(interval);
            goto(resolve("/"));
          }
        }, 1000);
      } else {
        username = response.data.username;
        room = response.data.room;
        userColor = getColor(response.data.color);

        roomState.joined = true;
      }
    });
  }

  // leave
  let showLeaveDialog = $state(false);

  function leaveRoom() {
    socket.emit(EVENT_LEAVE_ROOM, (response) => {
      if (response.success) {
        goto(resolve("/"));
      }
    });
  }

  // kick
  let showKickDialog = $state(false);
  let userToKick = $state<string>();
  let userToKickColor = $state<Colors>(Colors.EMPTY);
  let userToKickPieceColor = $state<string>("#e6e6e6");

  function handleKickUser(user: UserData) {
    userToKick = user.username;
    userToKickColor = user.color;
    userToKickPieceColor = pieceColors[user.color].light;
    showKickDialog = true;
  }

  function kickUser(data: EventKickPayload) {
    socket.emit(EVENT_KICK, data, (response) => {
      if (response.success) {
        showKickDialog = false;
      }
    });
  }

  function onKick(data: EventKickData) {
    kickState.room = data.room;
    kickState.show = true;
    goto(resolve("/"));
  }

  // messages
  let message = $state<string>("");
  let inputFocused = $state<boolean>(false);
  let messages = $state<Array<EventMessageData>>([]);
  let messagesContainer = $state<HTMLDivElement>();

  $effect(() => {
    if (messages.length && messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });

  function sendMessage() {
    if (message) {
      const data: EventMessagePayload = { message };
      socket.emit(EVENT_MESSAGE, data, (response) => {
        if (response.success) {
          message = "";
        }
      });
    }
  }

  function onMessage(data: EventMessageData) {
    messages.push({ from: data.from, message: data.message, color: data.color });
  }

  // warm-up
  let warmUp = $state<boolean>(false);

  function startWarmUp() {
    const data: GameSettings = {
      tick: 500 // TO CHANGE
    };
    socket.emit(EVENT_WARMUP_START, data, (response) => {
      if (response.success) {
        warmUp = true;
      }
    });
  }

  const keyToActionMap: Record<string, GameActions> = {
    ARROWUP: GameActions.UP,
    Z: GameActions.UP,
    W: GameActions.UP,
    ARROWDOWN: GameActions.DOWN,
    S: GameActions.DOWN,
    ARROWLEFT: GameActions.LEFT,
    A: GameActions.LEFT,
    Q: GameActions.LEFT,
    ARROWRIGHT: GameActions.RIGHT,
    D: GameActions.RIGHT,
    " ": GameActions.SPACE
  };

  function onWarmUpKeydown(event: KeyboardEvent) {
    if (warmUp && !inputFocused) {
      const action = keyToActionMap[event.key.toLocaleUpperCase()];

      if (action === undefined) return;

      socket.emit(EVENT_WARMUP_ACTION, { action }, (response) => {
        if (response.success) {
          gameData = response.data;
        }
      });
    }
  }

  function onWarmUpInfo(data: GameData) {
    gameData = data;
  }

  function onWarmUpFinish() {
    warmUp = false;
    gameData = undefined;
  }

  onMount(() => {
    localStorage.setItem("username", username.substring(0, USERNAME_MAX_LENGTH));

    if (!roomState.joined) joinRoom();

    socket.on(EVENT_KICK, onKick);
    socket.on(EVENT_MESSAGE, onMessage);
    socket.on(EVENT_WARMUP_INFO, onWarmUpInfo);
    socket.on(EVENT_WARMUP_FINISH, onWarmUpFinish);

    return () => {
      socket.off(EVENT_KICK, onKick);
      socket.off(EVENT_MESSAGE, onMessage);
      socket.off(EVENT_WARMUP_INFO, onWarmUpInfo);
      socket.off(EVENT_WARMUP_FINISH, onWarmUpFinish);
      leaveRoom();
    };
  });
</script>

<svelte:window on:keydown={onWarmUpKeydown} />

<div class="flex h-screen items-center justify-center bg-dark-primary gap-32">
  <!-- error & redirect -->
  {#if !roomState.joined}
    <div class="bg-dark-secondary px-8 py-4 ring-border ring">
      <div class="text-center">
        {#if errors.length > 0}
          {#if roomError}
            <p class="text-red-400 text-xl mb-2">
              <span class="font-semibold">Room:</span>
              {roomError}
            </p>
          {/if}
          {#if userError}
            <p class="text-red-400 text-xl mb-2">
              <span class="font-semibold">Username:</span>
              {userError}
            </p>
          {/if}
          {#if unusualError}
            <p class="text-red-400 text-xl mb-2">{unusualError}</p>
          {/if}
          <p>Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...</p>
        {:else}
          <p class="text-xl">Joining room "{room}" as "{username}"...</p>
        {/if}
      </div>
    </div>

    <!-- connected -->
  {:else if roomState.data}
    <div class="h-[640px] flex">
      <div class="p-4 bg-dark-secondary border border-border w-[360px] h-full flex flex-col">
        <h1 class="text-center text-red-primary overflow-hidden text-ellipsis text-3xl pb-2">
          {room}
        </h1>
        <span class="text-center text-xl">{roomState.data.userCount} / {roomState.data.max}</span>
        <ul class="py-4">
          {#each roomState.data.players as player, index (player.color)}
            <li
              class="p-2 text-lg flex items-center gap-2 group/list {username === player.username
                ? `border-l-2`
                : ''} {index % 2 === 0 ? 'bg-dark-accent' : ''}"
              style={username === player.username
                ? `border-color: ${userColor}; color: ${userColor};`
                : ""}
            >
              <Piece color={player.color} size={24} />
              <span class="overflow-hidden text-ellipsis">
                {player.username}
              </span>
              {#if roomState.data.host === player.username}
                <Crown color="#FFC832" />
              {/if}
              {#if roomState.data.host === username && player.username !== username}
                <button
                  onclick={() => handleKickUser(player)}
                  class="ml-auto btn btn-secondary group/button group-hover/list:opacity-100 opacity-0 duration-75 p-1"
                  style="--btn-depth: 2px;"
                >
                  <X size={20} class="group-hover/button:text-red-500 duration-100" />
                </button>
              {/if}
            </li>
          {/each}
        </ul>
        <div class="mt-auto space-y-4">
          {#if roomState.data.host === username}
            <button
              onclick={() => (showLeaveDialog = true)}
              class="btn btn-secondary text-lg py-1.5 w-full"
            >
              leave room
            </button>
          {:else}
            <p class="text-center text-white/70">Waiting for the host to start...</p>
          {/if}
          {#if roomState.data.host === username}
            <button
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
      <div
        class="bg-dark-secondary border-t border-b border-r border-border flex flex-col h-[640px] w-96"
      >
        <div bind:this={messagesContainer} class="flex-1 flex flex-col overflow-y-auto py-1 gap-3">
          {#each messages as m, index (index)}
            <div class="space-y-1 flex flex-col">
              <div
                class="flex items-center gap-2
              {username === m.from ? 'ml-auto pr-2' : 'pl-2'}"
                style="color: {username === m.from ? pieceColors[m.color].light : ''}"
              >
                <Piece color={m.color} size={16} />
                {m.from}
              </div>

              <div
                class="p-2 wrap-break-word w-fit max-w-64 text-white text-sm
              {username === m.from ? 'ml-auto' : ' bg-dark-accent'}"
                style="background-color: {username === m.from ? pieceColors[m.color].dark : ''}"
              >
                {m.message}
              </div>
            </div>
          {/each}
        </div>
        <div class="h-10 border-t border-border mt-auto flex">
          <TextInput
            bind:value={message}
            bind:focused={inputFocused}
            maxlength={MESSAGE_MAX_LENGTH}
            placeholder="Type your message..."
            border={false}
            fontSize="sm"
            fill={true}
            outline={false}
            onEnter={sendMessage}
            regex={REGEX_MESSAGE_SANITIZE}
            bright
          />
          <button
            onclick={sendMessage}
            class="btn btn-primary w-12 flex items-center justify-center ml-auto"
            style="--btn-depth: 0px;"
          >
            <Send />
          </button>
        </div>
      </div>
    </div>

    <!-- warm-up -->
    <div class="relative border-4 border-red-secondary box-content">
      {#if gameData}
        <!-- BOARD -->
        {#each gameData.matrix as row, index_row (index_row)}
          <div class="flex">
            {#each row as cell, index_cell (index_cell)}
              {#if cell !== Colors.EMPTY}
                <Piece color={cell} size={32} />
              {:else if isShadowCell(gameData, index_row, index_cell)}
                <!-- Shadow piece preview -->
                <div class="relative">
                  <Piece color={Colors.EMPTY} size={32} />
                  <div
                    class="absolute inset-0.5 border-2 rounded-xs opacity-75"
                    style="border-color: {pieceColors[gameData.shadowPiece.color].light};"
                  ></div>
                </div>
              {:else}
                <Piece color={cell} size={32} />
              {/if}
            {/each}
          </div>
        {/each}

        <!-- SCORE -->
        <div class="absolute -top-12 right-1/2 translate-x-1/2 text-xl">
          Score: {gameData.score}
        </div>

        <!-- NEXT PIECES -->
        <div class="absolute top-0 -right-48 text-xl flex flex-col gap-2 items-center">
          <span>Next</span>

          <div class="border-2 border-border flex flex-col w-40 py-8 items-center gap-8">
            {#each gameData.nextPieces as piece, index (index)}
              <div>
                {#each piece.matrix as row, index_cell (index_cell)}
                  <div class="flex">
                    {#each row as cell, index_cell (index_cell)}
                      {#if !row.some((cell) => cell)}
                        <!-- do nothing if none of the cells are filled -->
                      {:else if cell !== Colors.EMPTY}
                        <Piece color={piece.color} size={32} />
                      {:else}
                        <div class="h-[32px] w-[32px]"></div>
                      {/if}
                    {/each}
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      {:else}
        {#each { length: 20 }, index_row (index_row)}
          <div class="flex">
            {#each { length: 10 }, index_cell (index_cell)}
              <Piece color={Colors.EMPTY} size={32} />
            {/each}
          </div>
        {/each}
      {/if}

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
    </div>
  {/if}
</div>

<!-- [ DIALOGS ] -->

<!--confirm kick dialog -->
{#if showKickDialog}
  <Dialog
    icon={UserX}
    confirm="kick"
    confirmCallback={() => kickUser({ username: userToKick! })}
    title="Confirm kick"
    cancel="cancel"
    bind:open={showKickDialog}
  >
    <p>
      Do you want to kick
      <span class="px-1 space-x-1 text-nowrap">
        <Piece color={userToKickColor} size="1em" inline />
        <span style="color: {userToKickPieceColor}">
          {userToKick}
        </span>
      </span>
      from the room?
    </p>
  </Dialog>
{/if}

<!-- confirm leave dialog -->
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
