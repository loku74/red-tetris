import { type AddressInfo } from "node:net";
import { Server } from "socket.io";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { init } from "../../app";
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants";
import { Room, rooms } from "../objects/Room";
import { User, users } from "../objects/User";
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

describe("Invalid join", () => {
  const fakeUser = new User("id", "name", null);

  it("empty scheme", async () => {
    await emitAsync(test1.client, "join room", {}).then(({ res }) => {
      expect(res).toEqual({ success: false });
    });
  });
  it("room is full", async () => {
    const room = new Room("example", fakeUser);

    for (let i = 1; i < ROOM_MAX_USERS; i++) {
      room.add(new User(`a${i}`, `a${i}`, null));
    }
    rooms.set("example", room);

    await emitAsync(test1.client, "join room", {
      username: "user1",
      room: "example"
    }).then(({ err, res }) => {
      expect(err.room).toContain("is full");
      expect(res).toEqual({ success: false });
    });
  });
  it("maximum of rooms", async () => {
    for (let i = 0; i < ROOM_MAX; i++) {
      rooms.set(i, new Room(`test${i}`, fakeUser));
    }
    await emitAsync(test1.client, "join room", {
      username: "user1",
      room: "example"
    }).then(({ err, res }) => {
      expect(err.room).toContain("number of rooms reached");
      expect(res).toEqual({ success: false });
    });
  });
  it("username already taken", async () => {
    rooms.set("example", new Room("example", fakeUser));
    await emitAsync(test1.client, "join room", {
      username: "name",
      room: "example"
    }).then(({ err, res }) => {
      expect(err.room).toContain("is already taken");
      expect(res).toEqual({ success: false });
    });
  });
  it("already in a room", async () => {
    await emitAsync(test1.client, "join room", {
      username: "user1",
      room: "example"
    });
    await emitAsync(test1.client, "join room", {
      username: "user1",
      room: "example2"
    }).then(({ err, res }) => {
      expect(err.room).toContain("already in room example");
      expect(res).toEqual({ success: false });
    });
  });
});

it("Valid join", async () => {
  await emitAsync(test1.client, "join room", {
    username: "example",
    room: "example"
  }).then(({ res }) => {
    expect(res).toEqual({
      success: true,
      room: {
        players: ["example"],
        userCount: 1,
        max: ROOM_MAX_USERS,
        host: "example"
      }
    });
  });
});

it("Get rooms", () => {
  rooms.set("example", new Room("example", new User("id", "example", null)));

  return new Promise<void>((resolve) => {
    test1.client.emit("get rooms", ((err, response) => {
      expect(response).toEqual({
        rooms: [
          {
            name: "example",
            userCount: 1,
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
  const test3 = await createClient(address, io);
  const disconnectListener1 = onceAsync(test1.server, "disconnect");
  const disconnectListener2 = onceAsync(test2.server, "disconnect");
  const disconnectListener3 = onceAsync(test3.server, "disconnect");

  await emitAsync(test1.client, "join room", {
    username: "user1",
    room: "example"
  });
  await emitAsync(test2.client, "join room", {
    username: "user2",
    room: "example"
  });
  const roomListener = onceAsync(test1.client, "room");
  await emitAsync(test3.client, "join room", {
    username: "user3",
    room: "example"
  });

  // client1 is warned that a 2 players are here using "room" event
  const data1 = (await roomListener) as RoomInfo;
  expect(rooms.get("example")?.asInfo()).toEqual(data1);

  // disconnect user3, but should not change
  // anything since it's not a host
  test3.client.close();
  await disconnectListener3;
  expect(rooms.get("example")?.asInfo().host).toEqual("user1");

  // then host disconnect
  test1.client.close();
  await disconnectListener1;

  // a new host has been setted
  const roomListener2 = onceAsync(test2.client, "room");
  const data2 = (await roomListener2) as RoomInfo;
  expect(rooms.get("example")?.asInfo()).toEqual(data2);
  expect(data2.host).toEqual("user2");

  test2.client.close();
  await disconnectListener2;

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
  }).then(({ res }) => {
    // check the callback value
    expect(res).toEqual({ success: true });
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

describe("Invalid kick", () => {
  async function joinRoom(): Promise<Room | undefined> {
    await emitAsync(test1.client, "join room", {
      username: "user1",
      room: "example"
    });
    const room = rooms.get("example");
    expect(room).toBeDefined();

    return room;
  }

  it("not in a room", async () => {
    // not in a room
    await emitAsync(test1.client, "kick", {
      username: "user2",
      room: "example"
    }).then(({ err, res }) => {
      expect(err.kick).toContain("belong to");
      expect(res).toEqual({ success: false });
    });
  });
  it("inexisting room", async () => {
    await joinRoom();
    await emitAsync(test1.client, "kick", {
      username: "user2",
      room: "example1"
    }).then(({ err, res }) => {
      expect(err.kick).toContain("does not exist!");
      expect(res).toEqual({ success: false });
    });
  });
  // not host
  it("not host", async () => {
    const room = await joinRoom();

    room.host = new User("dumb", "someone", null);
    await emitAsync(test1.client, "kick", {
      username: "user2",
      room: "example"
    }).then(({ err, res }) => {
      expect(err.kick).toContain("host of this");
      expect(res).toEqual({ success: false });
    });
  });

  it("him self", async () => {
    await joinRoom();
    await emitAsync(test1.client, "kick", {
      username: "user1",
      room: "example"
    }).then(({ err, res }) => {
      expect(err.kick).toContain("yourself");
      expect(res).toEqual({ success: false });
    });
  });

  it("an user not in the room", async () => {
    await joinRoom();

    users["test"] = new User("test", "user3", null);
    await emitAsync(test1.client, "kick", {
      username: "user3",
      room: "example"
    }).then(({ err, res }) => {
      expect(err.kick).toContain("is not in");
      expect(res).toEqual({ success: false });
    });
  });

  it("same host name, but different rooms", async () => {
    await joinRoom();

    const user2 = new User("2", "test", null);
    rooms.set("example2", new Room("example2", user2));

    await emitAsync(test1.client, "join room", {
      username: "test",
      room: "example"
    });
    // try to usurpate another room with an host
    // with the same name
    await emitAsync(test1.client, "kick", {
      username: "test",
      room: "example2"
    }).then(({ err, res }) => {
      expect(err.kick).toContain("host of this");
      expect(res).toEqual({ success: false });
    });
  });
});
