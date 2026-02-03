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
import { getRoom, setRoom } from "../core/room";
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
      room: "example"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_ROOM_IS_FULL);
      }
    });
  });

  it("maximum of rooms", async () => {
    for (let i = 0; i < ROOM_MAX; i++) {
      setRoom(i.toString(), new Room(`test${i}`, user));
    }
    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      room: "example"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_MAX_ROOMS);
      }
    });
  });

  it("username already taken", async () => {
    setRoom("example", new Room("example", user));

    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "name",
      room: "example"
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
      room: "example"
    });
    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      room: "example2"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_ALREADY_IN_A_ROOM);
      }
    });
  });

  it("room already started", async () => {
    setRoom("example", new Room("example", user));
    getRoom("example")?.start();

    await emitAsync<unknown, EventJoinRoomError>(ctx.test1.client, EVENT_JOIN_ROOM, {
      username: "user1",
      room: "example"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_PLAYING_ROOM);
      }
    });
  });
});

it("valid join", async () => {
  const payload = {
    username: "example",
    room: "example"
  };
  await emitAsync<EventJoinRoomSuccess>(ctx.test1.client, EVENT_JOIN_ROOM, payload).then(
    (response) => {
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.room).toBe("example");
        expect(response.data.username).toBe("example");
      }
    }
  );
});

it("host changed", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const test3 = await createClient(ctx.address, ctx.io);
  const roomListener = onceAsync<RoomData>(ctx.test1.client, EVENT_ROOM_UPDATE);

  await emitAsync(ctx.test1.client, EVENT_JOIN_ROOM, {
    username: "user1",
    room: "example"
  });
  await emitAsync(test2.client, EVENT_JOIN_ROOM, {
    username: "user2",
    room: "example"
  });
  await emitAsync(test3.client, EVENT_JOIN_ROOM, {
    username: "user3",
    room: "example"
  });

  const data1 = await roomListener;
  expect(data1.host).toBe("user1");

  ctx.test1.client.close();

  await new Promise((resolve) => setTimeout(resolve, 42));

  expect(getRoom("example")?.asInfo()).toEqual({
    name: "example",
    players: [
      { username: "user2", color: "red" },
      { username: "user3", color: "green" }
    ],
    userCount: 2,
    max: ROOM_MAX_USERS,
    host: "user2",
    playing: false,
    warmUpRestartDelay: WARMUP_RESTART_DELAY * 1_000
  });

  test2.client.close();
  test3.client.close();
});
