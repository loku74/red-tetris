import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  EventStartError,
  EventStartPayload,
  EventStartSuccess,
  GameSettings,
  RoomData
} from "@app/shared";
import { EVENT_GAME_START } from "@app/shared";

import type { TestServerData } from "./types";
import {
  createClient,
  emitAsync,
  fakeUser,
  onceAsync,
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
      ctx.test1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("not host", async () => {
    const { room } = await testJoinRoom(ctx.test1, "example", "user1");

    room.host = fakeUser("dumb", "someone");
    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      ctx.test1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("already started", async () => {
    const { room } = await testJoinRoom(ctx.test1, "example", "user1");
    room.start();

    await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
      ctx.test1.client,
      EVENT_GAME_START,
      GameSettings
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

it("valid start", async () => {
  const test2 = await createClient(ctx.address, ctx.io);

  await testJoinRoom(ctx.test1, "example", "user1");
  const { room } = await testJoinRoom(test2, "example", "user2");

  const listener1 = onceAsync<RoomData>(ctx.test1.client, EVENT_GAME_START);
  const listener2 = onceAsync<RoomData>(test2.client, EVENT_GAME_START);

  await testStartGame(ctx.test1);
  const roomInfo = room.asInfo();

  await listener1.then((data) => {
    expect(data).toEqual(roomInfo);
  });
  await listener2.then((data) => {
    expect(data).toEqual(roomInfo);
  });
});
