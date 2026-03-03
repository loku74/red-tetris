import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import type { GameData } from "@app/shared";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  EVENT_GAME_DEAD,
  EVENT_GAME_FINISH,
  EVENT_GAME_INFO,
  EVENT_GAME_PENALITY,
  PieceColor,
  PieceShape
} from "@app/shared";

import { SCORE_DICT } from "@app/constants/core";
import type { Game } from "@app/objects/Game";
import { Piece } from "@app/objects/Piece";
import { Player } from "@app/objects/Player";
import type { Room } from "@app/objects/Room";

import type { TestServerData, TestSocket } from "./types";
import {
  onceAsync,
  passGameCountdown,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom,
  testStartGame,
  testStartWarmup
} from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("game loop helpers", () => {
  let test1: TestSocket;
  let test2: TestSocket;
  let room: Room;
  let game: Game;
  let attachCurrentPieceMock: Mock;
  let applyPenalityMock: Mock;
  const pieceI = new Piece(PieceShape.I, 0, 3);
  const pieceO = new Piece(PieceShape.O, 0, 0);

  beforeEach(async () => {
    attachCurrentPieceMock = vi.spyOn(Player.prototype, "attachCurrentPiece");
    applyPenalityMock = vi.spyOn(Player.prototype, "applyPenality");

    test1 = ctx.socket1;
    test2 = ctx.socket2;

    await testJoinRoom(test1, "example", "user1");
    room = (await testJoinRoom(test2, "example", "user2")).room;

    const listener1 = onceAsync<GameData>(test1.client, EVENT_GAME_INFO);
    const listener2 = onceAsync<GameData>(test2.client, EVENT_GAME_INFO);

    vi.useFakeTimers();

    // start game
    await testStartGame(test1);

    const retrievedGame = room.game;
    expect(retrievedGame).toBeDefined();
    if (retrievedGame) game = retrievedGame;

    // check listeners
    await listener1.then((data) => {
      expect(data).toEqual(game.getGameInfo(test1.server.id));
    });
    await listener2.then((data) => {
      expect(data).toEqual(game.getGameInfo(test2.server.id));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("check fall of a piece", async () => {
    await passGameCountdown();
    expect(game.ongoing).toBe(true);

    // check that gravity is called for each player
    await vi.advanceTimersToNextTimerAsync();
    const player1 = game.getPlayer(test1.server.id);
    const player2 = game.getPlayer(test2.server.id);

    // piece should have moved
    expect(player1.actualPiece.alreadyMoved).toBe(true);
    expect(player2.actualPiece.alreadyMoved).toBe(true);
  });

  it("check penality generation", async () => {
    await passGameCountdown();
    expect(game.ongoing).toBe(true);

    const player1 = game.getPlayer(test1.server.id);
    const player2 = game.getPlayer(test2.server.id);

    player1.actualPiece = pieceO.clone();

    // fake a line to be cleared (a stop line and a line to clear)
    player1.board.matrix[2] = [0, 0, ...Array(BOARD_WIDTH - 3).fill(PieceColor.RED)];
    player1.board.matrix[3] = [0, ...Array(BOARD_WIDTH - 1).fill(PieceColor.RED)];

    const listener1 = onceAsync<GameData>(test2.client, EVENT_GAME_PENALITY);

    // there is 2 round because of the "last time" movement delay
    await vi.advanceTimersToNextTimerAsync();
    await vi.advanceTimersToNextTimerAsync();

    // piece should stop, reach the line and generate a penality
    expect(attachCurrentPieceMock).toBeCalledTimes(1);
    expect(applyPenalityMock).toBeCalledTimes(1);
    expect(player2.board.playableLines).toBe(BOARD_HEIGHT - 1);

    await listener1.then((data) => {
      const gameInfo = game.getGameInfo(player2.user.id);
      gameInfo.gameScore = SCORE_DICT[1];
      expect(data).toStrictEqual(gameInfo);
    });
  });

  it("restart game, same room", async () => {
    await vi.advanceTimersToNextTimerAsync();

    const player1 = game.getPlayer(test1.server.id);
    const player2 = game.getPlayer(test2.server.id);

    player1.actualPiece = pieceI.clone();
    player2.actualPiece = pieceI.clone();

    // to make game faster
    player1.board.matrix[1] = [0, ...Array(BOARD_WIDTH - 1).fill(PieceColor.RED)];
    player2.board.matrix[1] = [0, ...Array(BOARD_WIDTH - 1).fill(PieceColor.RED)];

    const listener1 = onceAsync<undefined>(test1.client, EVENT_GAME_FINISH);
    const listener2 = onceAsync<undefined>(test2.client, EVENT_GAME_FINISH);
    const listener3 = onceAsync<undefined>(test2.client, EVENT_GAME_DEAD);
    const listener4 = onceAsync<undefined>(test2.client, EVENT_GAME_DEAD);

    // instant death
    await passGameCountdown();
    await listener3;
    await listener4;

    expect(player1.alive).toBe(false);
    expect(player2.alive).toBe(false);
    expect(game.ongoing).toBe(false);

    await vi.advanceTimersToNextTimerAsync();

    await listener1;
    await listener2;

    // the game should be restartable
    const listener5 = onceAsync<GameData>(test1.client, EVENT_GAME_INFO);
    const listener6 = onceAsync<GameData>(test2.client, EVENT_GAME_INFO);

    const retrievedGame = (await testStartGame(test1)).game;
    await listener5.then((data) => {
      expect(data).toEqual(retrievedGame.getGameInfo(test1.server.id));
    });
    await listener6.then((data) => {
      expect(data).toEqual(retrievedGame.getGameInfo(test2.server.id));
    });
  });
});

it("warmup running and starting game", async () => {
  await testJoinRoom(ctx.socket1, "test", "user1");
  await testJoinRoom(ctx.socket2, "test", "user2");
  await testJoinRoom(ctx.socket3, "test", "user3");

  const listener1 = onceAsync(ctx.socket1.client, EVENT_GAME_INFO);
  const listener2 = onceAsync(ctx.socket2.client, EVENT_GAME_INFO);

  const warmUp1 = await testStartWarmup(ctx.socket2);
  const warmUp2 = await testStartWarmup(ctx.socket3);
  expect(warmUp1.game.ongoing).toBe(true);
  expect(warmUp2.game.ongoing).toBe(true);

  const { game } = await testStartGame(ctx.socket1);

  expect(warmUp1.game.ongoing).toBe(false);
  expect(warmUp2.game.ongoing).toBe(false);

  await listener1.then((data) => {
    expect(data).toEqual(game.getGameInfo(ctx.socket1.server.id));
  });
  await listener2.then((data) => {
    expect(data).toEqual(game.getGameInfo(ctx.socket2.server.id));
  });
});
