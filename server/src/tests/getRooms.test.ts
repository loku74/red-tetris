import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { EventGetRoomsError, EventGetRoomsPayload, EventGetRoomsSuccess } from "@app/shared";
import { EVENT_GET_ROOMS } from "@app/shared";

import { ROOM_MAX_USERS } from "@app/constants/core";
import { getRoom, setRoom } from "@app/core/room";
import { Room } from "@app/objects/Room";

import type { TestServerData } from "./types";
import { emitAsync, fakeUser, setupTestServer, shutdownTestServer } from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe(EVENT_GET_ROOMS, () => {
  it("simple", async () => {
    setRoom("example", new Room("example", fakeUser("id", "example")));

    await emitAsync<EventGetRoomsPayload, EventGetRoomsSuccess, EventGetRoomsError>(
      ctx.socket1.client,
      EVENT_GET_ROOMS
    ).then((response) => {
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual([
          {
            name: "example",
            userCount: 1,
            max: ROOM_MAX_USERS
          }
        ]);
      }
    });
  });

  it("ignore rooms in game", async () => {
    setRoom("example", new Room("example", fakeUser("id", "example")));
    setRoom("example2", new Room("example2", fakeUser("id2", "example2")));
    getRoom("example2")?.start();

    await emitAsync<EventGetRoomsPayload, EventGetRoomsSuccess, EventGetRoomsError>(
      ctx.socket1.client,
      EVENT_GET_ROOMS
    ).then((response) => {
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual([
          {
            name: "example",
            userCount: 1,
            max: ROOM_MAX_USERS
          }
        ]);
      }
    });
  });
});
