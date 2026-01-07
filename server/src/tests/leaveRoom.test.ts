import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rooms } from "../objects/Room";
import { users } from "../objects/User";
import type { TestServerData } from "./types";
import {
  createClient,
  emitAsync,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";
import { INEXISTING_ROOM, USER_NOT_FOUND } from "../constants/error";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid leave room", () => {
  it("user not found", async () => {
    await emitAsync(ctx.test1.client, "leave room").then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(USER_NOT_FOUND);
      expect(success).toBe(false);
    });
  });

  it("inexisting room", async () => {
    await joinRoom(ctx.test1, "example", "test");
    const retrieveUser = rooms.get("example")?.get("test");

    if (retrieveUser) {
      retrieveUser.room = null;
      rooms.clear();
    }

    await emitAsync(ctx.test1.client, "leave room").then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(INEXISTING_ROOM);
      expect(success).toBe(false);
    });
  });
});

it("valid leave room", async () => {
  const test2 = await createClient(ctx.address, ctx.io);

  await joinRoom(ctx.test1, "example", "test");
  await joinRoom(test2, "example", "test2");

  const userBefore = users.get(ctx.test1.server.id);
  expect(userBefore).toBeDefined();
  expect(users.size).toBe(2);

  const listener = onceAsync(test2.client, "room update");

  await emitAsync(ctx.test1.client, "leave room").then(({ success }) => {
    expect(success).toBe(true);
  });

  // check that the action is effective and host updated here
  const roomInfo = rooms.get("example")?.asInfo();
  expect(roomInfo?.host).toEqual("test2");
  expect(roomInfo?.players.length).toEqual(1);

  // the user should not exist anymore in memory
  const user = users.get(ctx.test1.server.id);
  expect(user).toBeUndefined();
  expect(users.size).toBe(1);

  // check that the remaining user have the good informations
  await listener.then((data) => {
    expect(data).toEqual(roomInfo);
  });
});
