// global
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { EVENT_GAME_START } from "../constants/events";
import {
  ERROR_NOT_HOST,
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM
} from "../constants/validateErrors";
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
import type { TestServerData } from "./types";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid start", () => {
  it("not in a room", async () => {
    await emitAsync(ctx.test1.client, EVENT_GAME_START).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(ERROR_NOT_IN_A_ROOM);
      expect(success).toBe(false);
    });
  });

  it("not host", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");

    room.host = fakeUser("dumb", "someone");
    await emitAsync(ctx.test1.client, EVENT_GAME_START).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(ERROR_NOT_HOST);
      expect(success).toBe(false);
    });
  });

  it("already started", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");
    room.start();

    await emitAsync(ctx.test1.client, EVENT_GAME_START).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(ERROR_PLAYING_ROOM);
      expect(success).toBe(false);
    });
  });
});

it("valid start", async () => {
  const test2 = await createClient(ctx.address, ctx.io);

  await joinRoom(ctx.test1, "example", "user1");
  await joinRoom(test2, "example", "user2");

  const listener1 = onceAsync(ctx.test1.client, EVENT_GAME_START);
  const listener2 = onceAsync(test2.client, EVENT_GAME_START);

  await emitAsync(ctx.test1.client, EVENT_GAME_START).then(({ success }) => {
    expect(success).toBe(true);
  });

  const roomInfo = getRoom("example")?.asInfo();

  await listener1.then((data) => {
    expect(data).toEqual(roomInfo);
  });
  await listener2.then((data) => {
    expect(data).toEqual(roomInfo);
  });
});
