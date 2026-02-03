// global
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// intern
import { WARMUP_RESTART_DELAY } from "../constants/core";
import { EVENT_WARMUP_INFO, EVENT_WARMUP_START } from "@app/shared";
import { emitAsync, joinRoom, onceAsync, setupTestServer, shutdownTestServer } from "./utils";
import * as GameModule from "../core/game";
import { getUser } from "../core/user";

// types
import type { EventWarmUpError } from "@app/shared";
import type { TestServerData } from "./types";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid warm-up", () => {
  it("not in a room", async () => {
    await emitAsync<unknown, EventWarmUpError>(ctx.test1.client, EVENT_WARMUP_START).then(
      (response) => {
        expect(response.success).toBe(false);
      }
    );
  });

  it("user room is playing", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");
    room.start();

    await emitAsync<unknown, EventWarmUpError>(ctx.test1.client, EVENT_WARMUP_START).then(
      (response) => {
        expect(response.success).toBe(false);
      }
    );
  });

  it("tries to restart too early", async () => {
    await joinRoom(ctx.test1, "example", "user1");

    await emitAsync(ctx.test1.client, EVENT_WARMUP_START);
    await emitAsync<unknown, EventWarmUpError>(ctx.test1.client, EVENT_WARMUP_START).then(
      (response) => {
        expect(response.success).toBe(false);
      }
    );
  });
});

it(
  "valid warm-up",
  async () => {
    await joinRoom(ctx.test1, "example", "user1");

    await emitAsync(ctx.test1.client, EVENT_WARMUP_START).then((response) => {
      expect(response.success).toBe(true);
    });

    await new Promise((resolve) => setTimeout(resolve, (WARMUP_RESTART_DELAY + 1) * 1_000));

    await emitAsync(ctx.test1.client, EVENT_WARMUP_START).then((response) => {
      expect(response.success).toBe(true);
    });
  },
  (WARMUP_RESTART_DELAY + 2) * 1_000
);

it("warmup loop", async () => {
  const handleGravityMock = vi.spyOn(GameModule.helpers, "handleGravity");
  const test1 = ctx.test1;
  await joinRoom(test1, "example1", "user1");

  const user = getUser(test1.server.id);
  expect(user).toBeDefined();
  if (!user) return;

  const listener1 = onceAsync(test1.client, EVENT_WARMUP_INFO);

  vi.useFakeTimers();

  // start warmup
  await emitAsync(test1.client, EVENT_WARMUP_START).then(({ success }) => {
    expect(success).toBe(true);
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
  expect(handleGravityMock).toBeCalledWith(game, player);
  expect(player.actualPiece.alreadyMoved).toBe(true);
});
