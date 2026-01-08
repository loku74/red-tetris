import type { SocketJoinRoomResponse } from "client-types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
import type { SocketRoomInfoData } from "../types/types";
import type { TestServerData } from "./types";
import {
  createClient,
  emitAsync,
  fakeUser,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";

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
    await emitAsync(ctx.test1.client, "join room", {}).then(({ success }) => {
      expect(success).toEqual(false);
    });
  });

  it("room is full", async () => {
    const room = new Room("example", user);
    for (let i = 1; i < ROOM_MAX_USERS; i++) {
      room.add(fakeUser(`a${i}`, `a${i}`));
    }
    setRoom("example", room);

    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).roomName).toBe(ERROR_ROOM_IS_FULL);
      expect(success).toBe(false);
    });
  });

  it("maximum of rooms", async () => {
    for (let i = 0; i < ROOM_MAX; i++) {
      setRoom(i.toString(), new Room(`test${i}`, user));
    }
    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).roomName).toBe(ERROR_MAX_ROOMS);
      expect(success).toBe(false);
    });
  });

  it("username already taken", async () => {
    setRoom("example", new Room("example", user));

    await emitAsync(ctx.test1.client, "join room", {
      username: "name",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).username).toBe(ERROR_USERNAME_TAKEN);
      expect(success).toBe(false);
    });
  });

  it("already in a room", async () => {
    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example"
    });
    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example2"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).roomName).toBe(ERROR_ALREADY_IN_A_ROOM);
      expect(success).toBe(false);
    });
  });

  it("room already started", async () => {
    setRoom("example", new Room("example", user));
    getRoom("example")?.start();

    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).roomName).toBe(ERROR_PLAYING_ROOM);
      expect(success).toBe(false);
    });
  });
});

it("valid join", async () => {
  const data = {
    username: "example",
    roomName: "example"
  };
  await emitAsync(ctx.test1.client, "join room", data).then(({ success, data }) => {
    expect(data).toEqual({
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
      warmUpRestartDelay: WARMUP_RESTART_DELAY
    } as SocketRoomInfoData);
    expect(success).toBe(true);
  });
});

it("host changed", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const roomListener = onceAsync(ctx.test1.client, "room update");
  const roomListener2 = onceAsync(test2.client, "room update");
  const disconnectListener = onceAsync(test2.server, "disconnect");

  await emitAsync(ctx.test1.client, "join room", {
    username: "user1",
    roomName: "example"
  });
  await emitAsync(test2.client, "join room", {
    username: "user2",
    roomName: "example"
  });

  const data1 = (await roomListener) as SocketRoomInfoData;
  expect(getRoom("example")?.asInfo()).toEqual(data1);

  ctx.test1.client.close();

  // a new host has been setted
  const data2 = (await roomListener2) as SocketRoomInfoData;
  expect(getRoom("example")?.asInfo()).toEqual(data2);
  expect(data2.host).toEqual("user2");

  test2.client.close();
  await disconnectListener;

  expect(getRooms().size).toEqual(0);
});
