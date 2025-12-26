import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createClient, emitAsync, onceAsync, setupTestServer, shutdownTestServer } from "./utils";
import { User } from "../objects/User";
import { Room, rooms } from "../objects/Room";
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants";
import type { TestServerData } from "./types";
import type { SocketJoinRoomResponse } from "client-types";
import type { SocketRoomInfoData } from "../types/types";

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
      room: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).room).toContain("is full");
      expect(success).toBe(false);
    });
  });

  it("maximum of rooms", async () => {
    for (let i = 0; i < ROOM_MAX; i++) {
      rooms.set(i.toString(), new Room(`test${i}`, fakeUser));
    }
    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).room).toContain("number of rooms reached");
      expect(success).toBe(false);
    });
  });

  it("username already taken", async () => {
    rooms.set("example", new Room("example", fakeUser));

    await emitAsync(ctx.test1.client, "join room", {
      username: "name",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).room).toContain("is already taken");
      expect(success).toBe(false);
    });
  });

  it("already in a room", async () => {
    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      room: "example"
    });
    await emitAsync(ctx.test1.client, "join room", {
      username: "user1",
      room: "example2"
    }).then(({ success, data }) => {
      expect((data as SocketJoinRoomResponse).room).toContain("already in room example");
      expect(success).toBe(false);
    });
  });
});

it("valid join", async () => {
  const data = {
    username: "example",
    room: "example"
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
      userCount: 1
    });
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
    room: "example"
  });
  await emitAsync(test2.client, "join room", {
    username: "user2",
    room: "example"
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
