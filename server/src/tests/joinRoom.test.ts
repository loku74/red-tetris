// global
import { EVENT_JOIN_ROOM, EVENT_ROOM_UPDATE } from "@app/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { ROOM_MAX, ROOM_MAX_USERS, WARMUP_RESTART_DELAY } from "../constants/core";
import {
  ERROR_ALREADY_IN_A_ROOM,
  ERROR_MAX_ROOMS,
  ERROR_PLAYING_ROOM,
  ERROR_ROOM_IS_FULL,
  ERROR_USERNAME_TAKEN
} from "../constants/validateErrors";
import { getRoom, getRooms, setRoom } from "../core/room";
import { Room } from "../objects/Room";
import {
  createClient,
  emitAsync,
  fakeUser,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";

// types
import type { EventJoinRoomError, EventJoinRoomSuccess, RoomData } from "@app/shared";
import type { TestServerData } from "./types";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid join", () => {
  const user = fakeUser("id", "name");

  it("invalid scheme", async () => {
    await emitAsync(ctx.test1.client, EVENT_JOIN_ROOM, {}).then(({ success }) => {
      expect(success).toEqual(false);
    });
  });

  it("room is full", async () => {
    const room = new Room("example", user);
    for (let i = 1; i < ROOM_MAX_USERS; i++) {
      room.add(fakeUser(`a${i}`, `a${i}`));
    }
    setRoom("example", room);

    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      roomName: "example"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.roomName).toBe(ERROR_ROOM_IS_FULL);
      }
    });
  });

  it("maximum of rooms", async () => {
    for (let i = 0; i < ROOM_MAX; i++) {
      setRoom(i.toString(), new Room(`test${i}`, user));
    }
    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      roomName: "example"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.roomName).toBe(ERROR_MAX_ROOMS);
      }
    });
  });

  it("username already taken", async () => {
    setRoom("example", new Room("example", user));

    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "name",
      roomName: "example"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.username).toBe(ERROR_USERNAME_TAKEN);
      }
    });
  });

  it("already in a room", async () => {
    await emitAsync(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      roomName: "example"
    });
    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      roomName: "example2"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.roomName).toBe(ERROR_ALREADY_IN_A_ROOM);
      }
    });
  });

  it("room already started", async () => {
    setRoom("example", new Room("example", user));
    getRoom("example")?.start();

    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      roomName: "example"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.roomName).toBe(ERROR_PLAYING_ROOM);
      }
    });
  });
});

it("valid join", async () => {
  const payload = {
    username: "example",
    roomName: "example"
  };
  await emitAsync<EventJoinRoomSuccess>(ctx.test1.client, EVENT_JOIN_ROOM, payload).then(
    (response) => {
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.roomInfo).toEqual({
          host: "example",
          max: ROOM_MAX_USERS,
          name: "example",
          players: [
            {
              color: "cyan",
              username: "example"
            }
          ],
          userCount: 1,
          playing: false,
          warmUpRestartDelay: WARMUP_RESTART_DELAY * 1_000
        } as RoomData);
      }
    }
  );
});

it("host changed", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const roomListener = onceAsync<RoomData>(ctx.test1.client, EVENT_ROOM_UPDATE);
  const roomListener2 = onceAsync<RoomData>(test2.client, EVENT_ROOM_UPDATE);

  await emitAsync(ctx.test1.client, EVENT_JOIN_ROOM, {
    username: "user1",
    roomName: "example"
  });
  await emitAsync(test2.client, EVENT_JOIN_ROOM, {
    username: "user2",
    roomName: "example"
  });

  const data1 = await roomListener;
  expect(getRoom("example")?.asInfo()).toEqual(data1);

  ctx.test1.client.close();

  // a new host has been setted
  const data2 = await roomListener2;
  expect(getRoom("example")?.asInfo()).toEqual(data2);
  expect(data2.host).toEqual("user2");

  test2.client.close();

  // wait for disconnect to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(getRooms().size).toEqual(0);
});
