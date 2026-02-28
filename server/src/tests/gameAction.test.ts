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
});

it("game perform action", async () => {
  const applyMovement = vi.spyOn(MovementModule, "applyMovement");
  await testJoinRoom(ctx.socket1, "example1", "user1");
  await testJoinRoom(ctx.socket2, "example1", "user2");

  vi.useFakeTimers();

  const { game, player } = await testStartGame(ctx.socket1);

  // make on fall tick
  await vi.advanceTimersToNextTimerAsync();
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
  expect(applyMovement).toBeCalledTimes(1);
  expect(applyMovement).toBeCalledWith(game, player, "RIGHT");
});
