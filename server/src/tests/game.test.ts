// global
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

// intern
import {
  EVENT_GAME_FINISH,
  EVENT_GAME_INFO,
  EVENT_GAME_PENALITY,
  EVENT_GAME_START
} from "@app/shared";
import { PIECES } from "@app/shared";
import { BOARD_WIDTH } from "../constants/core";
import { getRoomBySocket } from "../core/room";
import {
  createClient,
  emitAsync,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";
import { Piece } from "../objects/Piece";
import * as GameModule from "../core/game";

// types
import type { TestServerData, TestSocket } from "./types";
import type { Room } from "../objects/Room";
import type { Game } from "../objects/Game";

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
  let handleGravityMock: Mock;
  let attachActualPieceMock: Mock;
  let applyPenalityMock: Mock;
  const pieceI = new Piece("I", PIECES.I.matrix, -1, 3, PIECES.I.color);
  const pieceO = new Piece("O", PIECES.O.matrix, 0, 3, PIECES.O.color);

  beforeEach(async () => {
    handleGravityMock = vi.spyOn(GameModule.helpers, "handleGravity");
    attachActualPieceMock = vi.spyOn(GameModule.helpers, "attachActualPiece");
    applyPenalityMock = vi.spyOn(GameModule.helpers, "applyPenality");

    test1 = ctx.test1;
    test2 = await createClient(ctx.address, ctx.io);

    await joinRoom(test1, "example", "user1");
    await joinRoom(test2, "example", "user2");

    const retrieveRoom = getRoomBySocket(test1.server);
    expect(retrieveRoom).toBeDefined();
    if (retrieveRoom) room = retrieveRoom;

    const listener1 = onceAsync(test1.client, EVENT_GAME_INFO);
    const listener2 = onceAsync(test2.client, EVENT_GAME_INFO);

    vi.useFakeTimers();

    // start room
    await emitAsync(test1.client, EVENT_GAME_START).then(({ success }) => {
      expect(success).toBe(true);
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
    await vi.advanceTimersToNextTimerAsync();
    expect(game.started).toBe(true);

    // check that gravity is called for each player
    await vi.advanceTimersToNextTimerAsync();
    const player1 = game.getPlayer(test1.server.id);
    const player2 = game.getPlayer(test2.server.id);

    // handleGravity function should have been called
    expect(handleGravityMock).toBeCalledTimes(2);
    expect(handleGravityMock).toBeCalledWith(game, player1);
    expect(handleGravityMock).toBeCalledWith(game, player2);

    // piece should have moved
    expect(player1.actualPiece.alreadyMoved).toBe(true);
    expect(player2.actualPiece.alreadyMoved).toBe(true);
  });

  it("check penality generation", async () => {
    await vi.advanceTimersToNextTimerAsync();
    expect(game.started).toBe(true);

    const player1 = game.getPlayer(test1.server.id);
    const player2 = game.getPlayer(test2.server.id);

    player1.actualPiece = pieceO.clone();

    // fake a line to be cleared
    player1.board.matrix[3] = [1, ...Array(BOARD_WIDTH - 1).fill(1)];

    const listener1 = onceAsync(test2.client, EVENT_GAME_PENALITY);

    // there is 2 round because of the "last time" movement delay
    await vi.advanceTimersToNextTimerAsync();
    await vi.advanceTimersToNextTimerAsync();

    // piece should stop reach the line and generate a penality
    expect(handleGravityMock).toBeCalledTimes(4);
    expect(attachActualPieceMock).toBeCalledTimes(1);
    expect(attachActualPieceMock).toBeCalledWith(game, player1);
    expect(applyPenalityMock).toBeCalledTimes(1);
    expect(applyPenalityMock).toBeCalledWith(game, player1);
    expect(player2.board.restrictedLines).toBe(1);

    // check socket
    await listener1.then((data) => {
      expect(data).toStrictEqual({
        from: player1.user.name
      });
    });
  });

  it("restart game, same room", async () => {
    await vi.advanceTimersToNextTimerAsync();

    const player1 = game.getPlayer(test1.server.id);
    const player2 = game.getPlayer(test2.server.id);

    player1.actualPiece = pieceI.clone();
    player2.actualPiece = pieceI.clone();

    // to make game faster
    player1.board.matrix[1] = [0, ...Array(BOARD_WIDTH - 1).fill(1)];
    player2.board.matrix[1] = [0, ...Array(BOARD_WIDTH - 1).fill(1)];

    const listener1 = onceAsync(test1.client, EVENT_GAME_FINISH);
    const listener2 = onceAsync(test2.client, EVENT_GAME_FINISH);

    // instant death
    await vi.advanceTimersToNextTimerAsync();

    expect(player1.alive).toBe(false);
    expect(player2.alive).toBe(false);
    expect(game.isFinish()).toBe(true);

    await listener1;
    await listener2;

    // the game should be restartable
    const listener5 = onceAsync(test1.client, EVENT_GAME_INFO);
    const listener6 = onceAsync(test2.client, EVENT_GAME_INFO);

    await emitAsync(test1.client, EVENT_GAME_START).then(({ success }) => {
      expect(success).toBe(true);
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
