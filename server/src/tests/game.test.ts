import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import type {
  EventStartError,
  EventStartPayload,
  EventStartSuccess,
  GameData,
  GameSettings
} from "@app/shared";
import {
  EVENT_GAME_FINISH,
  EVENT_GAME_INFO,
  EVENT_GAME_PENALITY,
  EVENT_GAME_START,
  PieceColor,
  PieceShape
} from "@app/shared";

import { BOARD_HEIGHT, BOARD_WIDTH } from "@app/constants/core";
import type { Game } from "@app/objects/Game";
import { Piece } from "@app/objects/Piece";
import { Player } from "@app/objects/Player";
import type { Room } from "@app/objects/Room";

import type { TestServerData, TestSocket } from "./types";
import {
  emitAsync,
  onceAsync,
  passGameCountdown,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom
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
  const GameSettings: GameSettings = {
    tick: 300
  };

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
    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      test1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(true);
    });

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
    const dataToCheck = game.getGameInfo(player2.user.id);
    await vi.advanceTimersToNextTimerAsync();

    // piece should stop, reach the line and generate a penality
    expect(attachCurrentPieceMock).toBeCalledTimes(1);
    expect(applyPenalityMock).toBeCalledTimes(1);
    expect(player2.board.playableLines).toBe(BOARD_HEIGHT - 1);

    // check socket
    await listener1.then((data) => {
      expect(data).toStrictEqual(dataToCheck);
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

    // instant death
    await passGameCountdown();

    expect(player1.alive).toBe(false);
    expect(player2.alive).toBe(false);
    expect(game.ongoing).toBe(false);

    await vi.advanceTimersToNextTimerAsync();

    await listener1;
    await listener2;

    // the game should be restartable
    const listener5 = onceAsync<GameData>(test1.client, EVENT_GAME_INFO);
    const listener6 = onceAsync<GameData>(test2.client, EVENT_GAME_INFO);

    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      test1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(true);
    });
    const retrievedGame = room.game;
    expect(retrievedGame).toBeDefined();
    if (!retrievedGame) return;

    // check listeners
    await listener5.then((data) => {
      expect(data).toEqual(retrievedGame.getGameInfo(test1.server.id));
    });
    await listener6.then((data) => {
      expect(data).toEqual(retrievedGame.getGameInfo(test2.server.id));
    });
  });
});
