import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  EventLeaveRoomError,
  EventLeaveRoomPayload,
  EventLeaveRoomSuccess,
  RoomData
} from "@app/shared";
import { EVENT_LEAVE_ROOM, EVENT_ROOM_UPDATE } from "@app/shared";

import { getRooms } from "@app/core/room";
import { getUser, getUsers } from "@app/core/user";

import type { TestServerData } from "./types";
import {
  createClient,
  emitAsync,
  onceAsync,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom
} from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid leave room", () => {
  it("user not found", async () => {
    await emitAsync<EventLeaveRoomPayload, EventLeaveRoomError, EventLeaveRoomSuccess>(
      ctx.socket1.client,
      EVENT_LEAVE_ROOM
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("inexisting room", async () => {
    await testJoinRoom(ctx.socket1, "example", "test");
    getRooms().clear();

    await emitAsync<EventLeaveRoomPayload, EventLeaveRoomError, EventLeaveRoomSuccess>(
      ctx.socket1.client,
      EVENT_LEAVE_ROOM
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

it("valid leave room", async () => {
  const test2 = await createClient(ctx.address, ctx.io);

  await testJoinRoom(ctx.socket1, "example", "test");
  const { room } = await testJoinRoom(test2, "example", "test2");
  expect(getUsers().size).toBe(2);

  const listener = onceAsync<RoomData>(test2.client, EVENT_ROOM_UPDATE);

  await emitAsync<EventLeaveRoomPayload, EventLeaveRoomError, EventLeaveRoomSuccess>(
    ctx.socket1.client,
    EVENT_LEAVE_ROOM
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  // check that the action is effective and host updated here
  const roomInfo = room.asInfo();
  expect(roomInfo?.host).toEqual("test2");
  expect(roomInfo?.players.length).toEqual(1);

  // the user should not exist anymore in memory
  const user = getUser(ctx.socket1.server.id);
  expect(user).toBeUndefined();
  expect(getUsers().size).toBe(1);

  // check that the remaining user have the good informations
  await listener.then((data) => {
    expect(data).toEqual(roomInfo);
  });
});
