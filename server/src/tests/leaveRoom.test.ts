// global
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { EVENT_LEAVE_ROOM, EVENT_ROOM_UPDATE } from "@app/shared";
import { ERROR_INEXISTING_ROOM, ERROR_USER_NOT_FOUND } from "../constants/validateErrors";
import { getRoom, getRooms } from "../core/room";
import { getUser, getUsers } from "../core/user";
import {
  createClient,
  emitAsync,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";

// types
import type { EventLeaveRoomError, RoomData } from "@app/shared";
import type { TestServerData } from "./types";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid leave room", () => {
  it("user not found", async () => {
    await emitAsync<unknown, EventLeaveRoomError>(ctx.test1.client, EVENT_LEAVE_ROOM).then(
      (response) => {
        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error.room).toBe(ERROR_USER_NOT_FOUND);
        }
      }
    );
  });

  it("inexisting room", async () => {
    await joinRoom(ctx.test1, "example", "test");
    getRooms().clear();

    await emitAsync<unknown, EventLeaveRoomError>(ctx.test1.client, EVENT_LEAVE_ROOM).then(
      (response) => {
        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error.room).toBe(ERROR_INEXISTING_ROOM);
        }
      }
    );
  });
});

it("valid leave room", async () => {
  const test2 = await createClient(ctx.address, ctx.io);

  await joinRoom(ctx.test1, "example", "test");
  await joinRoom(test2, "example", "test2");

  const userBefore = getUser(ctx.test1.server.id);
  expect(userBefore).toBeDefined();
  expect(getUsers().size).toBe(2);

  const listener = onceAsync<RoomData>(test2.client, EVENT_ROOM_UPDATE);

  await emitAsync(ctx.test1.client, EVENT_LEAVE_ROOM).then((response) => {
    expect(response.success).toBe(true);
  });

  // check that the action is effective and host updated here
  const roomInfo = getRoom("example")?.asInfo();
  expect(roomInfo?.host).toEqual("test2");
  expect(roomInfo?.players.length).toEqual(1);

  // the user should not exist anymore in memory
  const user = getUser(ctx.test1.server.id);
  expect(user).toBeUndefined();
  expect(getUsers().size).toBe(1);

  // check that the remaining user have the good informations
  await listener.then((data) => {
    expect(data).toEqual(roomInfo);
  });
});
