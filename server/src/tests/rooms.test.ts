import { type AddressInfo } from "node:net";
import { Server } from "socket.io";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { init } from "../../app";
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants";
import { Room, rooms } from "../objects/Room";
import { User, users } from "../objects/User";
import type { Callback, RoomInfo } from "../types/types";
import type { TestSocket } from "../types/server";
import { createClient, emitAsync, onceAsync } from "./utils";
import type { SocketJoinRoomError } from "client-types";
import type { SocketMessageData } from "../../../client/src/lib/types/socket";

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

it("Invalid join", async () => {
  const fakeUser = new User("id", "name", null);

  // room is full
  const room = new Room("example", fakeUser);
  for (let i = 1; i < ROOM_MAX_USERS; i++) {
    room.add(new User(`a${i}`, `a${i}`, null));
  }
  rooms.set("example", room);

  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  }).then(({ success, data }) => {
    expect((data as SocketJoinRoomError).room).toContain("is full");
    expect(success).toBe(false);
  });
  rooms.clear();

  // maximum of rooms
  for (let i = 0; i < ROOM_MAX; i++) {
    rooms.set(i.toString(), new Room(`test${i}`, fakeUser));
  }
  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  }).then(({ success, data }) => {
    expect((data as SocketJoinRoomError).room).toContain("number of rooms reached");
    expect(success).toBe(false);
  });
  rooms.clear();

  // username already taken
  rooms.set("example", new Room("example", fakeUser));
  await emitAsync(test1.client, "join room", {
    username: "name",
    room: "example"
  }).then(({ success, data }) => {
    expect((data as SocketJoinRoomError).room).toContain("is already taken");
    expect(success).toBe(false);
  });

  // already in a room
  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  });
  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example2"
  }).then(({ success, data }) => {
    expect((data as SocketJoinRoomError).room).toContain("already in room example");
    expect(success).toBe(false);
  });
  rooms.clear();
});

it("Valid join", () => {
  return new Promise<void>((resolve) => {
    const data = {
      username: "example",
      room: "example"
    };

    test1.client.emit("join room", data, ((success, data) => {
      expect(data).toEqual([
        {
          players: ["example"],
          userCount: 1,
          max: ROOM_MAX_USERS,
          host: "example"
        }
      ]);
      expect(success).toBe(true);
      resolve();
    }) as Callback);
  });
});

it("Get rooms", () => {
  rooms.set("example", new Room("example", new User("id", "example", null)));

  return new Promise<void>((resolve) => {
    test1.client.emit("get rooms", ((success, data) => {
      expect(data).toEqual([
        {
          name: "example",
          userCount: 1,
          max: ROOM_MAX_USERS
        }
      ]);
      expect(success).toBe(true);
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

  // a new host has been setted
  const data2 = (await roomListener2) as RoomInfo;
  expect(rooms.get("example")?.asInfo()).toEqual(data2);
  expect(data2.host).toEqual("user2");

  test2.client.close();
  await disconnectListener;

  expect(rooms.size).toEqual(0);
});

it("Kick", async () => {
  const test2 = await createClient(address, io);
  const kickListener = onceAsync(test2.client, "kick");
  let roomListener = null;

  // basic
  roomListener = onceAsync(test1.client, "room");
  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  });
  await emitAsync(test2.client, "join room", {
    username: "user2",
    room: "example"
  });
  await roomListener.then((data) => {
    expect(data).toEqual(rooms.get("example")?.asInfo());
  });

  roomListener = onceAsync(test1.client, "room");
  await emitAsync(test1.client, "kick", {
    username: "user2",
    room: "example"
  }).then(({ success }) => {
    // check the callback value
    expect(success).toBe(true);
  });
  await roomListener.then((data) => {
    // update of room trigered
    expect(data).toEqual(rooms.get("example")?.asInfo());
  });

  // victim is warned
  await kickListener.then((data) => {
    expect(data).toEqual({ room: "example" });
  });
});

it("Invalid kick", async () => {
  // not in a room
  await emitAsync(test1.client, "kick", {
    username: "user2",
    room: "example"
  }).then(({ success, data }) => {
    expect((data as { kick: string }).kick).toContain("belong to");
    expect(success).toBe(false);
  });

  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  });
  const room = rooms.get("example");
  expect(room).toBeDefined();

  // inexisting room
  await emitAsync(test1.client, "kick", {
    username: "user2",
    room: "example1"
  }).then(({ success, data }) => {
    expect((data as { kick: string }).kick).toContain("does not exist!");
    expect(success).toBe(false);
  });

  // not host
  room.host = new User("dumb", "someone", null);
  await emitAsync(test1.client, "kick", {
    username: "user2",
    room: "example"
  }).then(({ success, data }) => {
    expect((data as { kick: string }).kick).toContain("host of this");
    expect(success).toBe(false);
  });
  room.host = users.get(test1.server.id);

  // him self
  await emitAsync(test1.client, "kick", {
    username: "user1",
    room: "example"
  }).then(({ success, data }) => {
    expect((data as { kick: string }).kick).toContain("yourself");
    expect(success).toBe(false);
  });

  // an user not in the room
  users.set("test", new User("test", "user3", null));
  await emitAsync(test1.client, "kick", {
    username: "user3",
    room: "example"
  }).then(({ success, data }) => {
    expect((data as { kick: string }).kick).toContain("is not in");
    expect(success).toBe(false);
  });
});

it("chat", async () => {
  const test2 = await createClient(address, io);
  const message1 = "c'est un super message!";
  const message2 = "c'est une super réponse!";
  const chatListener1 = onceAsync(test1.client, "message");
  const chatListener2 = onceAsync(test2.client, "message");

  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  });
  await emitAsync(test2.client, "join room", {
    username: "user2",
    room: "example"
  });

  // users talks
  await emitAsync(test1.client, "chat", {
    message: message1,
    room: "example"
  }).then(({ success }) => {
    expect(success).toBe(true);
  });
  await emitAsync(test2.client, "chat", {
    message: message2,
    room: "example"
  }).then(({ success }) => {
    expect(success).toBe(true);
  });

  // check results
  const data2 = (await chatListener2) as SocketMessageData;
  expect(data2.from).toEqual("user1");
  expect(data2.message).toEqual(message1);

  const data1 = (await chatListener1) as SocketMessageData;
  expect(data1.from).toEqual("user2");
  expect(data1.message).toEqual(message2);
});

describe("Invalid chat", () => {
  it("not in a room", async () => {
    await emitAsync(test1.client, "chat", {
      message: "test",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { chat: string }).chat).toContain("do not belong to a room");
      expect(success).toBe(false);
    });
  });
  it("wrong room", async () => {
    await emitAsync(test1.client, "join room", {
      username: "user1",
      room: "example2"
    });
    await emitAsync(test1.client, "chat", {
      message: "test",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { chat: string }).chat).toContain("not in the room");
      expect(success).toBe(false);
    });
  });
});
