import type { SocketJoinRoomResponse } from "client-types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants/core";
import {
  ALREADY_IN_A_ROOM,
  MAX_ROOMS,
  PLAYING_ROOM,
  ROOM_IS_FULL,
  USERNAME_TAKEN
} from "../constants/validateErrors";
import { Room, rooms } from "../objects/Room";
import { User } from "../objects/User";
import type { SocketRoomInfoData } from "../types/types";
import type { TestServerData } from "./types";
import { createClient, emitAsync, onceAsync, setupTestServer, shutdownTestServer } from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid join", () => {
  const fakeUser = new User("id", "name", null);

  it("invalid scheme", async () => {
    await emitAsync(ctx.test1.client, "join room", {}).then(({ success }) => {
      expect(success).toEqual(false);
    });
  });

  it("room is full", async () => {
    const room = new Room("example", fakeUser);
    for (let i = 1; i < ROOM_MAX_USERS; i++) {
      room.add(new User(`a${i}`, `a${i}`, null));
    }
    rooms.set("example", room);

    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).roomName).toBe(ROOM_IS_FULL);
      expect(success).toBe(false);
    });
  });

  it("maximum of rooms", async () => {
    for (let i = 0; i < ROOM_MAX; i++) {
      rooms.set(i.toString(), new Room(`test${i}`, fakeUser));
    }
    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).roomName).toBe(MAX_ROOMS);
      expect(success).toBe(false);
    });
  });

  it("username already taken", async () => {
    rooms.set("example", new Room("example", fakeUser));

    await emitAsync(ctx.test1.client, "join room", {
      username: "name",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).username).toBe(USERNAME_TAKEN);
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
      expect((data as SocketJoinRoomResponse).roomName).toBe(ALREADY_IN_A_ROOM);
      expect(success).toBe(false);
    });
  });

  it("room already started", async () => {
    rooms.set("example", new Room("example", fakeUser));
    rooms.get("example")?.start();

    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      roomName: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).roomName).toBe(PLAYING_ROOM);
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
      playing: false
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

  // client1 is warned that a new player is here using "room" event
  const data1 = (await roomListener) as SocketRoomInfoData;
  expect(rooms.get("example")?.asInfo()).toEqual(data1);

  ctx.test1.client.close();

  // a new host has been setted
  const data2 = (await roomListener2) as SocketRoomInfoData;
  expect(rooms.get("example")?.asInfo()).toEqual(data2);
  expect(data2.host).toEqual("user2");

  test2.client.close();
  await disconnectListener;

  expect(rooms.size).toEqual(0);
});
