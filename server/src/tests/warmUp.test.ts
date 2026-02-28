import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  EventWarmUpError,
  EventWarmUpPayload,
  EventWarmUpSuccess,
  GameData,
  GameSettings
} from "@app/shared";
import { EVENT_WARMUP_INFO, EVENT_WARMUP_START } from "@app/shared";

import type { TestServerData } from "./types";
import {
  emitAsync,
  onceAsync,
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

const GameSettings: GameSettings = {
  tick: 300
};

describe("invalid warm-up", () => {
  it("not in a room", async () => {
    await emitAsync<EventWarmUpPayload, EventWarmUpSuccess, EventWarmUpError>(
      ctx.socket1.client,
      EVENT_WARMUP_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("user room is playing", async () => {
    const { room } = await testJoinRoom(ctx.socket1, "example", "user1");
    room.start();

    await emitAsync<EventWarmUpPayload, EventWarmUpSuccess, EventWarmUpError>(
      ctx.socket1.client,
      EVENT_WARMUP_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

it("valid warm-up", async () => {
  await testJoinRoom(ctx.socket1, "example", "user1");

  await emitAsync<EventWarmUpPayload, EventWarmUpSuccess, EventWarmUpError>(
    ctx.socket1.client,
    EVENT_WARMUP_START,
    GameSettings
  ).then((response) => {
    expect(response.success).toBe(true);
  });
});

it("warmup loop", async () => {
  const test1 = ctx.socket1;
  await testJoinRoom(test1, "example1", "user1");

  const listener1 = onceAsync<GameData>(test1.client, EVENT_WARMUP_INFO);

  vi.useFakeTimers();

  // start warmup
  const { game, player } = await testStartWarmup(test1);

  // check game info
  await listener1.then((data) => {
    expect(data).toEqual(game.getGameInfo(test1.server.id));
  });

  await vi.advanceTimersToNextTimerAsync();
  expect(game.ongoing).toBe(true);

  // check gravity fall
  expect(player.actualPiece.alreadyMoved).toBe(true);
});
