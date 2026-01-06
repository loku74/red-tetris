import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createClient,
  emitAsync,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";
import { Room, rooms } from "../objects/Room";
import { User, users } from "../objects/User";
import type { TestServerData } from "./types";
import {
  INEXISTING_ROOM,
  KICK_INEXISTING,
  KICK_ITSELF,
  KICK_PLAYING,
  NOT_HOST,
  NOT_IN_A_ROOM
} from "../constants/error";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid kick", () => {
  it("not in a room", async () => {
    await emitAsync(ctx.test1.client, "kick", {
      username: "user2",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(NOT_IN_A_ROOM);
      expect(success).toBe(false);
    });
  });

  it("inexisting room", async () => {
    await joinRoom(ctx.test1, "example", "user1");
    await emitAsync(ctx.test1.client, "kick", {
      username: "user2",
      room: "example1"
    }).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(INEXISTING_ROOM);
      expect(success).toBe(false);
    });
  });

  it("not host", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");

    room.host = new User("dumb", "someone", null);
    await emitAsync(ctx.test1.client, "kick", {
      username: "user2",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(NOT_HOST);
      expect(success).toBe(false);
    });
  });

  it("him self", async () => {
    await joinRoom(ctx.test1, "example", "user1");
    await emitAsync(ctx.test1.client, "kick", {
      username: "user1",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { username: string }).username).toBe(KICK_ITSELF);
      expect(success).toBe(false);
    });
  });

  it("an user not in the room", async () => {
    await joinRoom(ctx.test1, "example", "user1");

    users.set("test", new User("test", "user3", null));
    await emitAsync(ctx.test1.client, "kick", {
      username: "user3",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { username: string }).username).toBe(KICK_INEXISTING);
      expect(success).toBe(false);
    });
  });

  it("same host name, but different rooms", async () => {
    await joinRoom(ctx.test1, "example", "user1");

    const user2 = new User("2", "test", null);
    rooms.set("example2", new Room("example2", user2));

    await emitAsync(ctx.test1.client, "join room", {
      username: "test",
      room: "example"
    });
    // try to usurpate another room with an host
    // with the same name
    await emitAsync(ctx.test1.client, "kick", {
      username: "test",
      room: "example2"
    }).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(NOT_HOST);
      expect(success).toBe(false);
    });
  });

  it("room already started", async () => {
    await joinRoom(ctx.test1, "example", "user1");
    rooms.get("example")?.start();

    await emitAsync(ctx.test1.client, "kick", {
      username: "user2",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(KICK_PLAYING);
      expect(success).toBe(false);
    });
  });
});

it("valid kick", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const kickListener = onceAsync(test2.client, "kick");
  let roomListener = null;

  // basic
  roomListener = onceAsync(ctx.test1.client, "room update");
  await joinRoom(ctx.test1, "example", "user1");
  await joinRoom(test2, "example", "user2");

  await roomListener.then((data) => {
    expect(data).toEqual(rooms.get("example")?.asInfo());
  });

  roomListener = onceAsync(ctx.test1.client, "room update");
  await emitAsync(ctx.test1.client, "kick", {
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
