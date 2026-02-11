// global
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// intern
import { EVENT_WARMUP_INFO, EVENT_WARMUP_START } from "@app/shared";
import { emitAsync, joinRoom, onceAsync, setupTestServer, shutdownTestServer } from "./utils";
import { getUser } from "../core/user";

// types
import type {
  EventWarmUpError,
  EventWarmUpPayload,
  EventWarmUpSuccess,
  GameData,
  GameSettings
} from "@app/shared";
import type { TestServerData } from "./types";

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
      ctx.test1.client,
      EVENT_WARMUP_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("user room is playing", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");
    room.start();

    await emitAsync<EventWarmUpPayload, EventWarmUpSuccess, EventWarmUpError>(
      ctx.test1.client,
      EVENT_WARMUP_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

it("valid warm-up", async () => {
  await joinRoom(ctx.test1, "example", "user1");

  await emitAsync<EventWarmUpPayload, EventWarmUpSuccess, EventWarmUpError>(
    ctx.test1.client,
    EVENT_WARMUP_START,
    GameSettings
  ).then((response) => {
    expect(response.success).toBe(true);
  });
});

it("warmup loop", async () => {
  const test1 = ctx.test1;
  await joinRoom(test1, "example1", "user1");

  const user = getUser(test1.server.id);
  expect(user).toBeDefined();
  if (!user) return;

  const listener1 = onceAsync<GameData>(test1.client, EVENT_WARMUP_INFO);

  vi.useFakeTimers();

  // start warmup
  await emitAsync<EventWarmUpPayload, EventWarmUpSuccess, EventWarmUpError>(
    test1.client,
    EVENT_WARMUP_START,
    GameSettings
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  const game = user.warmUp;
  expect(game).toBeTruthy();
  if (!game) return;

  // check game info
  await listener1.then((data) => {
    expect(data).toEqual(game.getGameInfo(test1.server.id));
  });

  // retrieve player
  const player = game.players.get(user.id);
  expect(player).toBeDefined();
  if (!player) return;

  await vi.advanceTimersToNextTimerAsync();
  expect(game.ongoing).toBe(true);

  // check gravity fall
  expect(player.actualPiece.alreadyMoved).toBe(true);
});
