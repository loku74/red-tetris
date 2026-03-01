import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  EventStartError,
  EventStartPayload,
  EventStartSuccess,
  GameSettings
} from "@app/shared";
import { EVENT_GAME_START } from "@app/shared";

import type { TestServerData } from "./types";
import {
  emitAsync,
  fakeUser,
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

const GameSettings: GameSettings = {
  tick: 300
};

describe("invalid start", () => {
  it("not in a room", async () => {
    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      ctx.socket1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("not host", async () => {
    const { room } = await testJoinRoom(ctx.socket1, "example", "user1");

    room.host = fakeUser("dumb", "someone");
    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      ctx.socket1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("already started", async () => {
    const { room } = await testJoinRoom(ctx.socket1, "example", "user1");
    room.start();

    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      ctx.socket1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("alone in the room", async () => {
    const { room } = await testJoinRoom(ctx.socket1, "example", "user1");
    room.start();

    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      ctx.socket1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

it("valid start", async () => {
  const roomName = "example";
  await testJoinRoom(ctx.socket1, roomName, "user1");
  await testJoinRoom(ctx.socket2, roomName, "user2");

  await testStartGame(ctx.socket1);
});
