// global
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { WARMUP_RESTART_DELAY } from "../constants/core";
import { EVENT_WARM_UP } from "@app/shared";
import {
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM,
  ERROR_WARM_UP_TIMEOUT
} from "../constants/validateErrors";
import { emitAsync, joinRoom, setupTestServer, shutdownTestServer } from "./utils";

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
    await emitAsync<unknown, EventWarmUpError>(ctx.test1.client, EVENT_WARM_UP).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_NOT_IN_A_ROOM);
      }
    });
  });

  it("user room is playing", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");
    room.start();

    await emitAsync<unknown, EventWarmUpError>(ctx.test1.client, EVENT_WARM_UP).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_PLAYING_ROOM);
      }
    });
  });

  it("tries to restart too early", async () => {
    await joinRoom(ctx.test1, "example", "user1");

    await emitAsync(ctx.test1.client, EVENT_WARM_UP);
    await emitAsync<unknown, EventWarmUpError>(ctx.test1.client, EVENT_WARM_UP).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_WARM_UP_TIMEOUT);
      }
    });
  });
});

it(
  "valid warm-up",
  async () => {
    await joinRoom(ctx.test1, "example", "user1");

    await emitAsync(ctx.test1.client, EVENT_WARM_UP).then((response) => {
      expect(response.success).toBe(true);
    });

    await new Promise((resolve) => setTimeout(resolve, (WARMUP_RESTART_DELAY + 1) * 1_000));

    await emitAsync(ctx.test1.client, EVENT_WARM_UP).then((response) => {
      expect(response.success).toBe(true);
    });
  },
  (WARMUP_RESTART_DELAY + 2) * 1_000
);
