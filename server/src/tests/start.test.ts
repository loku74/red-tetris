// global
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { EVENT_GAME_START } from "@app/shared";
import { getRoom } from "../core/room";
import {
  createClient,
  emitAsync,
  fakeUser,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";

// types
import type {
  EventStartError,
  EventStartPayload,
  EventStartSuccess,
  RoomData,
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
    const room = await joinRoom(ctx.test1, "example", "user1");

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
    const room = await joinRoom(ctx.test1, "example", "user1");
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

  await joinRoom(ctx.test1, "example", "user1");
  await joinRoom(test2, "example", "user2");

  const listener1 = onceAsync<RoomData>(ctx.test1.client, EVENT_GAME_START);
  const listener2 = onceAsync<RoomData>(test2.client, EVENT_GAME_START);

  await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
    ctx.test1.client,
    EVENT_GAME_START,
    GameSettings
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  const roomInfo = getRoom("example")?.asInfo();

  await listener1.then((data) => {
    expect(data).toEqual(roomInfo);
  });
  await listener2.then((data) => {
    expect(data).toEqual(roomInfo);
  });
});
