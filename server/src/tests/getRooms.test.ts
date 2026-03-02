import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { EventGetRoomsError, EventGetRoomsPayload, EventGetRoomsSuccess } from "@app/shared";
import { EVENT_GET_ROOMS } from "@app/shared";

import { ROOM_MAX_USERS } from "@app/constants/core";

import type { TestServerData } from "./types";
import { emitAsync, setupTestServer, shutdownTestServer, testJoinRoom } from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe(EVENT_GET_ROOMS, () => {
  it("room list", async () => {
    await testJoinRoom(ctx.socket1, "test", "user1");
    await testJoinRoom(ctx.socket2, "test2", "user2");
    const { room } = await testJoinRoom(ctx.socket3, "test2", "user3");
    room.start();

    await emitAsync<EventGetRoomsPayload, EventGetRoomsSuccess, EventGetRoomsError>(
      ctx.socket4.client,
      EVENT_GET_ROOMS
    ).then((response) => {
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual([
          {
            name: "test",
            userCount: 1,
            max: ROOM_MAX_USERS,
            playing: false
          },
          {
            name: "test2",
            userCount: 2,
            max: ROOM_MAX_USERS,
            playing: true
          }
        ]);
      }
    });
  });
});
