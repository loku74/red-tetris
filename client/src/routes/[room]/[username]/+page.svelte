<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { DoorOpen, Eye, Settings, UserX } from "@lucide/svelte";

  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import type {
    EventJoinRoomPayload,
    EventKickData,
    EventKickPayload,
    EventMessageData,
    EventMessagePayload,
    EventSpectatePayload,
    GameData,
    GameScore,
    GameSettings,
    PlayerInfo,
    PlayerScore,
    UserColor,
    UserData
  } from "@app/shared";
  import {
    EVENT_CHANGE_COLOR,
    EVENT_GAME_ACTION,
    EVENT_GAME_COUNTDOWN,
    EVENT_GAME_DEAD,
    EVENT_GAME_FINISH,
    EVENT_GAME_INFO,
    EVENT_GAME_RESET_SPECTATE,
    EVENT_GAME_SPECTATE,
    EVENT_GAME_SPECTRUM,
    EVENT_GAME_START,
    EVENT_JOIN_ROOM,
    EVENT_KICK,
    EVENT_LEAVE_ROOM,
    EVENT_MESSAGE,
    EVENT_WARMUP_ACTION,
    EVENT_WARMUP_FINISH,
    EVENT_WARMUP_INFO,
    EVENT_WARMUP_START,
    GAME_TICK_DEFAULT,
    GAME_TICK_MAX,
    GAME_TICK_MIN,
    PIECE_COLORS,
    PieceColor,
    USERNAME_MAX_LENGTH
  } from "@app/shared";

  import Checkbox from "$lib/components/Checkbox.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Board from "$lib/components/Game/Board.svelte";
  import BoardActions from "$lib/components/Game/BoardActions.svelte";
  import GameCountdown from "$lib/components/Game/GameCountdown.svelte";
  import GameSpectrums from "$lib/components/Game/GameSpectrums.svelte";
  import NextPieces from "$lib/components/Game/NextPieces.svelte";
  import Score from "$lib/components/Game/Score.svelte";
  import ScoreBoard from "$lib/components/Game/ScoreBoard.svelte";
  import ScorePopup from "$lib/components/Game/ScorePopup.svelte";
  import Lobby from "$lib/components/Lobby/Lobby.svelte";
  import LobbyCheck from "$lib/components/Lobby/LobbyCheck.svelte";
  import Piece from "$lib/components/Piece.svelte";

  import { kickState } from "$lib/state/kick.svelte";
  import { roomState } from "$lib/state/room.svelte";

  import { keyToAction } from "$lib/constants/keyToActions";
  import { getSocket } from "$lib/socket/socket.svelte";

  // username & room info from url params
  roomState.room = page.params.room || "";
  roomState.username = page.params.username || "";

  // lobby check component bind
  let lobbyCheck = $state<ReturnType<typeof LobbyCheck>>();

  // socket
  const socket = getSocket();

  // game data
  let gameData = $state<GameData>();
  let lastGameData = $state<GameData>();

  function setGameData(data: GameData) {
    gameData = data;
    if (data.gameScore) {
      gameScore = data.gameScore;
    }
  }

  function emitJoinRoom() {
    const data: EventJoinRoomPayload = {
      username: roomState.username,
      room: roomState.room
    };
    socket.emit(EVENT_JOIN_ROOM, data, (response) => {
      if (!response.success) {
        lobbyCheck!.startCountdown(response.error);
      } else {
        localStorage.setItem("username", roomState.username.substring(0, USERNAME_MAX_LENGTH));

        roomState.username = response.data.username;
        roomState.room = response.data.room;
        roomState.color = response.data.color;

        roomState.joined = true;
      }
    });
  }

  function emitColorChange(color: UserColor): Promise<boolean> {
    return new Promise((resolve) => {
      socket.emit(EVENT_CHANGE_COLOR, { color }, (response) => {
        if (response.success) {
          roomState.color = response.data.color;
        }
        resolve(response.success);
      });
    });
  }

  // leave
  let showLeaveDialog = $state(false);

  function emitLeaveRoom() {
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
  let userToKickHexColor = $state("#e6e6e6");

  function handleKickUser(user: UserData) {
    userToKick = user.username;
    userToKickColor = user.color;
    userToKickHexColor = PIECE_COLORS[user.color].light;
    showKickDialog = true;
  }

  function emitKickUser(data: EventKickPayload) {
    socket.emit(EVENT_KICK, data, (response) => {
      if (response.success) {
        showKickDialog = false;
      }
    });
  }

  function onSocketKick(data: EventKickData) {
    kickState.room = data.room;
    kickState.show = true;
    goto(resolve("/"));
  }

  // messages
  let messageInputFocused = $state(false);
  let messages = $state<Array<EventMessageData>>([]);

  function emitMessage(msg: string): Promise<boolean> {
    return new Promise((resolve) => {
      const data: EventMessagePayload = { message: msg };
      socket.emit(EVENT_MESSAGE, data, (response) => {
        resolve(response.success);
      });
    });
  }

  function onSocketMessage(data: EventMessageData) {
    messages.push({ from: data.from, message: data.message, color: data.color });
  }

  // warm-up
  let warmUp = $state(false);

  function emitStartWarmUp() {
    socket.emit(EVENT_WARMUP_START, (response) => {
      if (response.success) {
        warmUp = true;
      }
    });
  }

  function onSocketWarmUpFinish() {
    warmUp = false;
    gameData = undefined;
  }

  // game
  let game = $state(false);

  let gameCountdown = $state(0);
  let showGo = $state(false);

  let gameScore = $state<GameScore>();
  let finalScore = $state<PlayerScore[]>([]);
  let showFinalScore = $state(false);
  let dead = $state(false);

  function emitStartGame() {
    const data: GameSettings = {
      tick: gameTick * 100,
      destructiblePenality: destructiblePenality
    };

    socket.emit(EVENT_GAME_START, { settings: data }, () => {});
  }

  function onSocketGameStart() {
    showFinalScore = false;
    game = true;
  }

  function onSocketGameCountdown(countdown: number) {
    gameCountdown = countdown;
    if (countdown === 0) {
      showGo = true;
      setTimeout(() => (showGo = false), 420);
    }
  }

  function onSocketGameInfo(data: GameData) {
    setGameData(data);
  }

  function emitGameAction(event: KeyboardEvent) {
    if (!dead && (game || warmUp) && !messageInputFocused) {
      const action = keyToAction[event.key.toLocaleUpperCase()];

      if (action === undefined) return;

      const eventType = game ? EVENT_GAME_ACTION : EVENT_WARMUP_ACTION;

      socket.emit(eventType, { action }, (response) => {
        if (response.success) {
          setGameData(response.data);
        }
      });
    }
  }

  function onSocketGameFinish(data: PlayerScore[]) {
    game = false;
    gameData = undefined;
    lastGameData = undefined;
    spectrums = undefined;

    spectatedPlayer = undefined;
    spectators = 0;

    finalScore = data;
    showFinalScore = true;
  }

  function onSocketGameDead(data: GameData) {
    dead = true;
    gameData = data;
    gameData.shadowPiece = undefined;
    lastGameData = gameData;
  }

  // spectrum
  let spectrums = $state<PlayerInfo[]>();
  function onSocketGameSpectrum(data: PlayerInfo[]) {
    spectrums = data.filter((spectrum) => spectrum.color !== roomState.color);
  }

  // spectate
  let spectatedPlayer = $state<UserData>();
  let spectators = $state<number>(0);

  function emitSpectate(username: string) {
    if (spectatedPlayer?.username === username) return;
    const data: EventSpectatePayload = { username };
    socket.emit(EVENT_GAME_SPECTATE, data, (response) => {
      if (response.success) {
        spectatedPlayer = response.data.userData;
        gameData = response.data.gameData;
      }
    });
  }

  function onSocketGameSpectate(nbSpectators: number) {
    spectators = nbSpectators;
  }

  function emitResetSpectate() {
    socket.emit(EVENT_GAME_RESET_SPECTATE, () => {});
    gameData = lastGameData;
    spectatedPlayer = undefined;
  }

  // settings
  let showSettings = $state(false);

  let gameTick = $state(GAME_TICK_DEFAULT / 100);
  let destructiblePenality = $state(false);

  onMount(() => {
    if (!roomState.joined) emitJoinRoom();

    socket.on(EVENT_KICK, onSocketKick);
    socket.on(EVENT_MESSAGE, onSocketMessage);
    socket.on(EVENT_WARMUP_INFO, onSocketGameInfo);
    socket.on(EVENT_WARMUP_FINISH, onSocketWarmUpFinish);
    socket.on(EVENT_GAME_START, onSocketGameStart);
    socket.on(EVENT_GAME_INFO, onSocketGameInfo);
    socket.on(EVENT_GAME_COUNTDOWN, onSocketGameCountdown);
    socket.on(EVENT_GAME_FINISH, onSocketGameFinish);
    socket.on(EVENT_GAME_SPECTRUM, onSocketGameSpectrum);
    socket.on(EVENT_GAME_DEAD, onSocketGameDead);
    socket.on(EVENT_GAME_SPECTATE, onSocketGameSpectate);

    return () => {
      socket.off(EVENT_KICK, onSocketKick);
      socket.off(EVENT_MESSAGE, onSocketMessage);
      socket.off(EVENT_WARMUP_INFO, onSocketGameInfo);
      socket.off(EVENT_WARMUP_FINISH, onSocketWarmUpFinish);
      socket.off(EVENT_GAME_START, onSocketGameStart);
      socket.off(EVENT_GAME_INFO, onSocketGameInfo);
      socket.off(EVENT_GAME_FINISH, onSocketGameFinish);
      socket.off(EVENT_GAME_COUNTDOWN, onSocketGameCountdown);
      socket.off(EVENT_GAME_SPECTRUM, onSocketGameSpectrum);
      socket.off(EVENT_GAME_DEAD, onSocketGameDead);
      socket.off(EVENT_GAME_SPECTATE, onSocketGameSpectate);

      emitLeaveRoom();
    };
  });
</script>

<svelte:window on:keydown={emitGameAction} />

<div class="flex h-screen items-center justify-center bg-dark-primary gap-16">
  <!-- error & redirect -->
  {#if !roomState.joined}
    <LobbyCheck bind:this={lobbyCheck} />

    <!-- connected -->
  {:else}
    {#if !game}
      <Lobby
        bind:showLeaveDialog
        bind:showSettings
        {handleKickUser}
        {emitColorChange}
        startGame={emitStartGame}
        {messages}
        bind:messageInputFocused
        emitSendMessage={emitMessage}
      />
    {/if}

    <!-- GAME & WARMUP-->
    <div class="relative border-4 border-red-secondary">
      <!-- BOARD -->
      <Board matrix={gameData?.matrix} shadowPiece={gameData?.shadowPiece} />

      {#if gameData}
        <Score score={gameData.score} />
        <div class="absolute top-0 -right-38 flex flex-col gap-8">
          <NextPieces nextPieces={gameData.nextPieces} />
          {#if spectators}
            <span transition:fade={{ duration: 42 }} class="flex items-center gap-2">
              <Eye size={24} />{spectators}
            </span>
          {/if}
        </div>
        {#if gameScore}
          <ScorePopup {gameScore} />
        {/if}
      {/if}

      {#if game && spectrums}
        <GameSpectrums {spectrums} {spectatedPlayer} {dead} onSpectate={emitSpectate} />
      {/if}

      <!-- BOARD BOTTOM INFO / ACTION -->
      <BoardActions
        {game}
        {warmUp}
        startWarmUp={emitStartWarmUp}
        bind:spectatedPlayer
        {emitResetSpectate}
      />

      <!-- GAME COUNTDOWN -->
      {#if gameCountdown > 0 || showGo}
        {#key gameCountdown}
          <GameCountdown animate={showGo && gameCountdown === 0 ? "go" : "pop"}>
            {gameCountdown > 0 ? gameCountdown : "GO!"}
          </GameCountdown>
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
    confirmCallback={() => emitKickUser({ username: userToKick! })}
    title="Confirm kick"
    cancel="cancel"
    bind:open={showKickDialog}
  >
    <p>
      Do you want to kick
      <span class="px-1 space-x-1 text-nowrap">
        <Piece color={userToKickColor} size="1em" inline />
        <span style="color: {userToKickHexColor}">
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
  confirmCallback={emitLeaveRoom}
  title="Leave room"
  cancel="cancel"
  bind:open={showLeaveDialog}
>
  <p class="text-white/75">Are you sure you want to leave the room?</p>
</Dialog>

<!-- settings dialog -->
<Dialog
  icon={Settings}
  confirm="ok"
  confirmCallback={() => (showSettings = false)}
  title="Game Settings"
  bind:open={showSettings}
>
  <div class="flex flex-col px-16 py-4 gap-3 w-full">
    <div class="flex justify-between gap-8">
      <label for="game_tick" class="text-nowrap">Game tick</label>
      <div class="flex gap-4">
        <input
          id="game_tick"
          name="game_tick"
          type="range"
          class="accent-red-primary w-32"
          min={GAME_TICK_MIN / 100}
          max={GAME_TICK_MAX / 100}
          bind:value={gameTick}
        />
        <span class="text-red-accent w-8 text-center">
          {gameTick < 10 ? `0.${gameTick}` : gameTick / 10}
        </span>
      </div>
    </div>

    <div class="flex justify-between">
      <label for="dynamic_clean">Dynamic clean</label>
      <div class="w-8 flex items-center justify-center">
        <Checkbox id="dynamic_clean" bind:checked={destructiblePenality} />
      </div>
    </div>
  </div>
</Dialog>

<ScoreBoard bind:open={showFinalScore} scores={finalScore} />
