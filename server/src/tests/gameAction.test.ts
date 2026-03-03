import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  EventGameActionError,
  EventGameActionPayload,
  EventGameActionSuccess
} from "@app/shared";
import { EVENT_GAME_ACTION, GameActions } from "@app/shared";

import * as MovementModule from "@app/core/movements";

import type { TestServerData } from "./types";
import {
  emitAsync,
  passGameCountdown,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom,
  testStartGame
} from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("wrong actions", () => {
  it("not in room", async () => {
    await emitAsync<EventGameActionPayload, EventGameActionSuccess, EventGameActionError>(
      ctx.socket1.client,
      EVENT_GAME_ACTION,
      { action: GameActions.RIGHT }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("game not started", async () => {
    await testJoinRoom(ctx.socket1, "example", "test");
    await emitAsync<EventGameActionPayload, EventGameActionSuccess, EventGameActionError>(
      ctx.socket1.client,
      EVENT_GAME_ACTION,
      { action: GameActions.RIGHT }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("dead player", async () => {
    await testJoinRoom(ctx.socket1, "example", "test");
    await testJoinRoom(ctx.socket2, "example", "test2");

    vi.useFakeTimers();
    const { player, game } = await testStartGame(ctx.socket1);

    await passGameCountdown();
    expect(game.ongoing).toBe(true);
    expect(player.alive).toBe(true);

    player.alive = false;

    await emitAsync<EventGameActionPayload, EventGameActionSuccess, EventGameActionError>(
      ctx.socket1.client,
      EVENT_GAME_ACTION,
      { action: GameActions.RIGHT }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
    vi.useRealTimers();
  });
});

it("game perform action", async () => {
  const applyMovement = vi.spyOn(MovementModule, "applyMovement");
  await testJoinRoom(ctx.socket1, "example1", "user1");
  await testJoinRoom(ctx.socket2, "example1", "user2");

  vi.useFakeTimers();

  const { game, player } = await testStartGame(ctx.socket1);

  await passGameCountdown();

  expect(game.ongoing).toBe(true);

  const pieceBeforeY = player.actualPiece.y;

  // perform simple action
  await emitAsync<EventGameActionPayload, EventGameActionSuccess, EventGameActionError>(
    ctx.socket1.client,
    EVENT_GAME_ACTION,
    { action: GameActions.RIGHT }
  ).then((response) => {
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(game.getGameInfo(ctx.socket1.server.id));
    }
  });
  expect(player.actualPiece.y).toBeGreaterThan(pieceBeforeY);
  expect(applyMovement).toBeCalledWith(game, player, "RIGHT");

  // others actions
  await emitAsync<EventGameActionPayload, EventGameActionSuccess, EventGameActionError>(
    ctx.socket1.client,
    EVENT_GAME_ACTION,
    { action: GameActions.LEFT }
  ).then((response) => {
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(game.getGameInfo(ctx.socket1.server.id));
    }
  });
  expect(applyMovement).toBeCalledWith(game, player, "LEFT");

  await emitAsync<EventGameActionPayload, EventGameActionSuccess, EventGameActionError>(
    ctx.socket1.client,
    EVENT_GAME_ACTION,
    { action: GameActions.DOWN }
  ).then((response) => {
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(game.getGameInfo(ctx.socket1.server.id));
    }
  });
  expect(applyMovement).toBeCalledWith(game, player, "DOWN");

  await emitAsync<EventGameActionPayload, EventGameActionSuccess, EventGameActionError>(
    ctx.socket1.client,
    EVENT_GAME_ACTION,
    { action: GameActions.UP }
  ).then((response) => {
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(game.getGameInfo(ctx.socket1.server.id));
    }
  });
  expect(applyMovement).toBeCalledWith(game, player, "UP");
});
