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
    Settings,
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
    UserColor,
    UserData
  } from "@app/shared";
  import {
    EVENT_CHANGE_COLOR,
    EVENT_GAME_ACTION,
    EVENT_GAME_COUNTDOWN,
    EVENT_GAME_FINISH,
    EVENT_GAME_INFO,
    EVENT_GAME_START,
    EVENT_JOIN_ROOM,
    EVENT_KICK,
    EVENT_LEAVE_ROOM,
    EVENT_MESSAGE,
    EVENT_WARMUP_ACTION,
    EVENT_WARMUP_FINISH,
    EVENT_WARMUP_INFO,
    EVENT_WARMUP_START,
    GAME_MIN_PLAYERS,
    GAME_TICK_DEFAULT,
    GAME_TICK_MAX,
    GAME_TICK_MIN,
    GameActions,
    MESSAGE_MAX_LENGTH,
    PIECE_COLORS,
    PieceColor,
    REGEX_MESSAGE_SANITIZE,
    USERNAME_MAX_LENGTH
  } from "@app/shared";

  import Dialog from "$lib/components/Dialog.svelte";
  import Piece from "$lib/components/Piece.svelte";
  import TextInput from "$lib/components/TextInput.svelte";
  import UserColorPicker from "$lib/components/UserColorPicker.svelte";

  import { kickState } from "$lib/state/kick.svelte";
  import { roomState } from "$lib/state/room.svelte";

  import { clickOutside } from "$lib/utils/clickOutside";

  import { getSocket } from "$lib/socket/socket.svelte";

  // url params & user infos
  let room = $state(page.params.room || "");
  let username = $state(page.params.username || "");

  // errors
  let roomError = $state<string>();
  let userError = $state<string>();
  let unusualError = $state<string>();
  let redirectCountdown = $state(5);

  let errors = $derived([roomError, userError, unusualError].filter((e) => e));

  // socket
  const socket = getSocket();

  // game data
  let gameData = $state<GameData>();

  // utils
  function getColor(color: PieceColor) {
    return PIECE_COLORS[color].light;
  }

  function isCurrentUser(name: string) {
    return username === name;
  }

  const isCurrentUserHost = $derived.by(() => {
    return roomState.data && isCurrentUser(roomState.data.host);
  });

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
          redirectCountdown--;
          if (redirectCountdown <= 0) {
            clearInterval(interval);
            goto(resolve("/"));
          }
        }, 1000);
      } else {
        localStorage.setItem("username", username.substring(0, USERNAME_MAX_LENGTH));

        username = response.data.username;
        room = response.data.room;
        roomState.color = response.data.color;

        roomState.joined = true;
      }
    });
  }

  // colors
  let userColor = $derived(roomState.color);
  let userHexColor = $derived(getColor(userColor));
  let showColorChoice = $state(false);

  function handleColorChange(color: UserColor) {
    socket.emit(EVENT_CHANGE_COLOR, { color }, (response) => {
      if (response.success) {
        showColorChoice = false;
        roomState.color = response.data.color;
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
  let userToKickColor = $state<UserColor>(PieceColor.GREY);
  let userToKickPieceColor = $state("#e6e6e6");

  function handleKickUser(user: UserData) {
    userToKick = user.username;
    userToKickColor = user.color;
    userToKickPieceColor = PIECE_COLORS[user.color].light;
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
  let message = $state("");
  let inputFocused = $state(false);
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

  // actions
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

  // tetris events
  function onGameInfo(data: GameData) {
    gameData = data;
  }

  function onGameKeydown(event: KeyboardEvent) {
    if ((game || warmUp) && !inputFocused) {
      const action = keyToActionMap[event.key.toLocaleUpperCase()];

      if (action === undefined) return;

      const eventType = game ? EVENT_GAME_ACTION : EVENT_WARMUP_ACTION;

      socket.emit(eventType, { action }, (response) => {
        if (response.success) {
          gameData = response.data;
        }
      });
    }
  }

  // warm-up
  let warmUp = $state(false);

  function startWarmUp() {
    const data: GameSettings = {
      tick: GAME_TICK_DEFAULT
    };
    socket.emit(EVENT_WARMUP_START, data, (response) => {
      if (response.success) {
        warmUp = true;
      }
    });
  }

  function onWarmUpFinish() {
    warmUp = false;
    gameData = undefined;
  }

  // game
  let game = $state(false);
  let gameCountdown = $state(0);
  let showGo = $state(false);

  function startGame() {
    const data: GameSettings = {
      tick: gameTick * 100
    };

    socket.emit(EVENT_GAME_START, data, () => {});
  }

  function onGameStart() {
    game = true;
  }

  function onGameCountdown(countdown: number) {
    gameCountdown = countdown;
    if (countdown === 0) {
      showGo = true;
      setTimeout(() => (showGo = false), 420);
    }
  }

  function onGameFinish() {
    game = false;
    gameData = undefined;
  }

  // settings
  let showSettings = $state(false);
  let gameTick = $state(GAME_TICK_DEFAULT / 100);

  onMount(() => {
    if (!roomState.joined) joinRoom();

    socket.on(EVENT_KICK, onKick);
    socket.on(EVENT_MESSAGE, onMessage);
    socket.on(EVENT_WARMUP_INFO, onGameInfo);
    socket.on(EVENT_WARMUP_FINISH, onWarmUpFinish);
    socket.on(EVENT_GAME_START, onGameStart);
    socket.on(EVENT_GAME_INFO, onGameInfo);
    socket.on(EVENT_GAME_COUNTDOWN, onGameCountdown);
    socket.on(EVENT_GAME_FINISH, onGameFinish);

    return () => {
      socket.off(EVENT_KICK, onKick);
      socket.off(EVENT_MESSAGE, onMessage);
      socket.off(EVENT_WARMUP_INFO, onGameInfo);
      socket.off(EVENT_WARMUP_FINISH, onWarmUpFinish);
      socket.off(EVENT_GAME_START, onGameStart);
      socket.off(EVENT_GAME_INFO, onGameInfo);
      socket.off(EVENT_GAME_FINISH, onGameFinish);
      socket.off(EVENT_GAME_COUNTDOWN, onGameCountdown);

      leaveRoom();
    };
  });
</script>

<svelte:window on:keydown={onGameKeydown} />

<div class="flex h-screen items-center justify-center bg-dark-primary gap-16">
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
          <p>Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? "s" : ""}...</p>
        {:else}
          <p class="text-xl">Joining room "{room}" as "{username}"...</p>
        {/if}
      </div>
    </div>

    <!-- connected -->
  {:else if roomState.data}
    {#if !game}
      <div class="h-[640px] flex">
        <div class="p-4 bg-dark-secondary border border-border w-[360px] h-full flex flex-col">
          <h1
            class="text-center text-red-primary overflow-hidden text-ellipsis text-3xl relative
            {isCurrentUserHost ? 'px-8' : ''}"
          >
            {room}
            {#if isCurrentUserHost}
              <button
                onclick={() => (showSettings = true)}
                class="absolute right-0 top-1/2 -translate-y-1/2 text-white/42 hover:text-white/74 hover:bg-dark-accent duration-100 p-1 rounded-lg"
              >
                <Settings />
              </button>
            {/if}
          </h1>
          <span class="py-2 text-center text-xl">
            {roomState.data.userCount} / {roomState.data.max}
          </span>
          <ul class="py-6">
            <!-- PLAYER LIST -->
            {#each roomState.data.players as player, index (player.color)}
              <li
                class="p-2 text-lg flex items-center gap-2 group/list border-l-2 border-l-transparent
                {index % 2 === 0 ? 'bg-dark-accent' : ''}"
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
                {#if roomState.data.host === player.username}
                  <Crown color="#FFC832" />
                {/if}

                <!-- kick button -->
                {#if isCurrentUserHost && !isCurrentUser(player.username)}
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
          <div class="mt-auto space-y-4">
            {#if isCurrentUserHost}
              <button
                onclick={() => (showLeaveDialog = true)}
                class="btn btn-secondary text-lg py-1.5 w-full"
              >
                leave room
              </button>
            {:else}
              <p class="text-center text-white/70">Waiting for the host to start...</p>
            {/if}
            {#if isCurrentUserHost}
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
        <div
          class="bg-dark-secondary border-t border-b border-r border-border flex flex-col h-[640px] w-96"
        >
          <div
            bind:this={messagesContainer}
            class="flex-1 flex flex-col overflow-y-auto py-1 gap-3"
          >
            {#each messages as m, index (index)}
              <div class="space-y-1 flex flex-col">
                <div
                  class="flex items-center gap-2
              {isCurrentUser(m.from) ? 'ml-auto pr-2' : 'pl-2'}"
                  style="color: {isCurrentUser(m.from) ? PIECE_COLORS[m.color].light : ''}"
                >
                  <Piece color={m.color} size={16} />
                  {m.from}
                </div>

                <div
                  class="p-2 wrap-break-word w-fit max-w-64 text-white text-sm
              {isCurrentUser(m.from) ? 'ml-auto' : ' bg-dark-accent'}"
                  style="background-color: {isCurrentUser(m.from)
                    ? PIECE_COLORS[m.color].dark
                    : ''}"
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
    {/if}

    <!-- GAME & WARMUP-->
    <div class="relative border-4 border-red-secondary box-content">
      {#if gameData}
        <!-- BOARD -->
        {#each gameData.matrix as row, index_row (index_row)}
          <div class="flex">
            {#each row as cell, index_cell (index_cell)}
              {#if cell !== PieceColor.EMPTY}
                <Piece color={cell} size={32} />
              {:else if isShadowCell(gameData, index_row, index_cell)}
                <!-- Shadow piece preview -->
                <div class="relative">
                  <Piece color={PieceColor.EMPTY} size={32} />
                  <div
                    class="absolute inset-0.5 border-2 rounded-xs opacity-75"
                    style="border-color: {PIECE_COLORS[gameData.shadowPiece.color].light};"
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
                      {:else if cell !== PieceColor.EMPTY}
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
              <Piece color={PieceColor.EMPTY} size={32} />
            {/each}
          </div>
        {/each}
      {/if}

      <!--BOARD BOTTOM INFO / ACTION -->
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
        <span
          class="absolute right-1/2 translate-x-1/2 -bottom-12 text-nowrap flex gap-2 items-center text-lg"
        >
          <Piece color={userColor} size={20} />
          <span style="color: {userHexColor}">
            {username}
          </span>
        </span>
      {/if}

      <!-- COUNTDOWN -->
      {#if gameCountdown > 0 || showGo}
        {#key gameCountdown}
          <div
            class="{showGo && gameCountdown === 0
              ? 'countdown-go'
              : 'countdown-pop'} absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 text-7xl"
          >
            {gameCountdown > 0 ? gameCountdown : "GO!"}
          </div>
        {/key}
      {/if}
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

<!-- settings dialog -->
<Dialog
  icon={Settings}
  confirm="exit"
  confirmCallback={() => (showSettings = false)}
  title="Game Settings"
  bind:open={showSettings}
>
  <div class="flex justify-between w-full px-16">
    <div class="flex gap-4">
      <label for="game_tick">Game tick</label>
      <input
        type="range"
        class="accent-red-primary"
        min={GAME_TICK_MIN / 100}
        max={GAME_TICK_MAX / 100}
        bind:value={gameTick}
        name="game_tick"
      />
    </div>
    <span class="text-red-accent w-4">
      {gameTick < 10 ? `0.${gameTick}` : gameTick / 10}
    </span>
  </div>
</Dialog>

<style>
  @keyframes countdown-pop {
    0% {
      transform: scale(2.42);
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }

  .countdown-pop {
    animation: countdown-pop 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes countdown-go {
    0% {
      transform: scale(2.42);
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  .countdown-go {
    animation: countdown-go 0.64s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
</style>
