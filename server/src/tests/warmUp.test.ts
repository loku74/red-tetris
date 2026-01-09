// global
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { WARMUP_RESTART_DELAY } from "../constants/core";
import { EVENT_WARM_UP } from "../constants/events";
import {
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM,
  ERROR_WARM_UP_TIMEOUT
} from "../constants/validateErrors";
import { emitAsync, joinRoom, setupTestServer, shutdownTestServer } from "./utils";

// types
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
    await emitAsync(ctx.test1.client, EVENT_WARM_UP).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(ERROR_NOT_IN_A_ROOM);
      expect(success).toBe(false);
    });
  });

  it("user room is playing", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");
    room.start();

    await emitAsync(ctx.test1.client, EVENT_WARM_UP).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(ERROR_PLAYING_ROOM);
      expect(success).toBe(false);
    });
  });

  it("tries to restart too early", async () => {
    await joinRoom(ctx.test1, "example", "user1");

    await emitAsync(ctx.test1.client, EVENT_WARM_UP);
    await emitAsync(ctx.test1.client, EVENT_WARM_UP).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(ERROR_WARM_UP_TIMEOUT);
      expect(success).toBe(false);
    });
  });
});

it(
  "valid warm-up",
  async () => {
    await joinRoom(ctx.test1, "example", "user1");

    await emitAsync(ctx.test1.client, EVENT_WARM_UP).then(({ success }) => {
      expect(success).toBe(true);
    });

    await new Promise((resolve) => setTimeout(resolve, WARMUP_RESTART_DELAY * 1_000));

    await emitAsync(ctx.test1.client, EVENT_WARM_UP).then(({ success }) => {
      expect(success).toBe(true);
    });
  },
  (WARMUP_RESTART_DELAY + 1) * 1_000
);
