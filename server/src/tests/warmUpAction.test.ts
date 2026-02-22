import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type {
  EventWarmUpActionError,
  EventWarmUpActionPayload,
  EventWarmUpActionSuccess
} from "@app/shared";
import { EVENT_WARMUP_ACTION, GameActions } from "@app/shared";

import * as MovementModule from "@app/core/movements";

import type { TestServerData } from "./types";
import {
  emitAsync,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom,
  testStartWarmup
} from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

it("warm up perform action", async () => {
  const applyMovement = vi.spyOn(MovementModule, "applyMovement");
  const test1 = ctx.test1;
  vi.useFakeTimers();

  await testJoinRoom(test1, "example", "user");
  const { game, player } = await testStartWarmup(test1);

  // make on fall tick
  await vi.advanceTimersToNextTimerAsync();
  expect(game.ongoing).toBe(true);

  const pieceBeforeY = player.actualPiece.y;

  // perform simple action
  await emitAsync<EventWarmUpActionPayload, EventWarmUpActionSuccess, EventWarmUpActionError>(
    test1.client,
    EVENT_WARMUP_ACTION,
    { action: GameActions.RIGHT }
  ).then((response) => {
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(game.getGameInfo(test1.server.id));
    }
  });
  expect(player.actualPiece.y).toBeGreaterThan(pieceBeforeY);
  expect(applyMovement).toBeCalledTimes(1);
  expect(applyMovement).toBeCalledWith(game, player, "RIGHT");
});
