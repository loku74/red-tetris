import { type AddressInfo } from "node:net";
import { Server } from "socket.io";
import { afterEach, beforeEach, expect, it } from "vitest";
import { init } from "../../app";
import { ROOM_MAX_USERS } from "../constants";
import { Room, rooms } from "../objects/Room";
import { User } from "../objects/User";
import type { Callback, RoomInfo, TestSocket } from "../types";
import { createClient, emitAsync, onceAsync } from "./utils";

let io: Server, test1: TestSocket, address: string;

// create test socket.io server
// see: https://socket.io/docs/v4/testing/
beforeEach(() => {
  return new Promise<void>((resolve) => {
    const struct = init();
    io = struct.io;

    struct.server.listen(async () => {
      address = `http://localhost:${(struct.server.address() as AddressInfo).port}`;

      test1 = await createClient(address, io);
      resolve();
    });
  });
});

afterEach(() => {
  io.close();
  test1.client.disconnect();
  rooms.clear();
});

it("Invalid scheme", () => {
  return new Promise<void>((resolve) => {
    test1.client.emit("join room", {}, ((err, response) => {
      expect(response).toEqual({ success: false });
      resolve();
    }) as Callback);
  });
});

it("Room is full", () => {
  const room = new Room("example", "example");
  const users = new Map<string, User>(
    Array.from({ length: ROOM_MAX_USERS }, (_, i) => [
      `example${i + 1}`,
      new User("dumb_id", `example${i + 1}`)
    ])
  );

  room.users = users;
  rooms.set("example", room);

  return new Promise<void>((resolve) => {
    const data = {
      username: "example",
      room: "example"
    };

    test1.client.emit("join room", data, ((err, response) => {
      expect(response).toEqual({ success: false });

      resolve();
    }) as Callback);
  });
});

it("Valid join", () => {
  return new Promise<void>((resolve) => {
    const data = {
      username: "example",
      room: "example"
    };

    test1.client.emit("join room", data, ((err, response) => {
      expect(response).toEqual({
        success: true,
        room: {
          players: ["example"],
          userCount: 1,
          max: ROOM_MAX_USERS,
          host: "example"
        }
      });
      resolve();
    }) as Callback);
  });
});

it("Get rooms", () => {
  rooms.set("example", new Room("example", "superhost"));

  return new Promise<void>((resolve) => {
    test1.client.emit("get rooms", ((err, response) => {
      expect(response).toEqual({
        rooms: [
          {
            name: "example",
            userCount: 0,
            max: ROOM_MAX_USERS
          }
        ]
      });
      resolve();
    }) as Callback);
  });
});

it("Host changed", async () => {
  const test2 = await createClient(address, io);
  const roomListener = onceAsync(test1.client, "room");
  const roomListener2 = onceAsync(test2.client, "room");
  const disconnectListener = onceAsync(test2.server, "disconnect");

  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  });
  await emitAsync(test2.client, "join room", {
    username: "user2",
    room: "example"
  });

  // client1 is warned that a new player is here using "room" event
  const data1 = (await roomListener) as RoomInfo;
  expect(rooms.get("example")?.asInfo()).toEqual(data1);

  test1.client.close();

  // a new host have been setted
  const data2 = (await roomListener2) as RoomInfo;
  expect(rooms.get("example")?.asInfo()).toEqual(data2);
  expect(data2.host).toEqual("user2");

  test2.client.close();
  await disconnectListener;

  expect(rooms.size).toEqual(0);
});
