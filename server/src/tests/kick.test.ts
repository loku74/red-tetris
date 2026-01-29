// global
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { EVENT_KICK, EVENT_ROOM_UPDATE } from "@app/shared";
import {
  ERROR_USER_NOT_FOUND,
  ERROR_KICK_PLAYING,
  ERROR_KICK_SELF,
  ERROR_NOT_HOST,
  ERROR_NOT_IN_A_ROOM
} from "../constants/validateErrors";
import { getRoom } from "../core/room";
import { setUser } from "../core/user";
import {
  createClient,
  emitAsync,
  fakeUser,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";

// types
import type { EventKickData, EventKickError, RoomData } from "@app/shared";
import type { TestServerData } from "./types";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid kick", () => {
  it("not in a room", async () => {
    await emitAsync<unknown, EventKickError>(ctx.test1.client, EVENT_KICK, {
      username: "user2"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.username).toBe(ERROR_NOT_IN_A_ROOM);
      }
    });
  });

  it("not host", async () => {
    const room = await joinRoom(ctx.test1, "example", "user1");

    room.host = fakeUser("dumb", "someone");
    await emitAsync<unknown, EventKickError>(ctx.test1.client, EVENT_KICK, {
      username: "user2"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.username).toBe(ERROR_NOT_HOST);
      }
    });
  });

  it("him self", async () => {
    await joinRoom(ctx.test1, "example", "user1");
    await emitAsync<unknown, EventKickError>(ctx.test1.client, EVENT_KICK, {
      username: "user1"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.username).toBe(ERROR_KICK_SELF);
      }
    });
  });

  it("an user not in the room", async () => {
    await joinRoom(ctx.test1, "example", "user1");

    setUser("test", fakeUser("test", "user3"));
    await emitAsync<unknown, EventKickError>(ctx.test1.client, EVENT_KICK, {
      username: "user3"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.username).toBe(ERROR_USER_NOT_FOUND);
      }
    });
  });

  it("same host name, but different rooms", async () => {
    const test2 = await createClient(ctx.address, ctx.io);
    const test3 = await createClient(ctx.address, ctx.io);

    await joinRoom(ctx.test1, "example", "user1");
    await joinRoom(test2, "example", "user2");
    await joinRoom(test3, "example", "user2");

    // try to usurpate another room with an host
    // with the same name
    await emitAsync<unknown, EventKickError>(test2.client, EVENT_KICK, {
      username: "test"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.username).toBe(ERROR_NOT_HOST);
      }
    });
  });

  it("room already started", async () => {
    await joinRoom(ctx.test1, "example", "user1");
    getRoom("example")?.start();

    await emitAsync<unknown, EventKickError>(ctx.test1.client, EVENT_KICK, {
      username: "user2"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.username).toBe(ERROR_KICK_PLAYING);
      }
    });
  });
});

it("valid kick", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const kickListener = onceAsync<EventKickData>(test2.client, EVENT_KICK);
  let roomListener: Promise<RoomData>;

  // basic
  roomListener = onceAsync<RoomData>(ctx.test1.client, EVENT_ROOM_UPDATE);
  await joinRoom(ctx.test1, "example", "user1");
  await joinRoom(test2, "example", "user2");

  await roomListener.then((data) => {
    expect(data).toEqual(getRoom("example")?.asInfo());
  });

  roomListener = onceAsync<RoomData>(ctx.test1.client, EVENT_ROOM_UPDATE);
  await emitAsync(ctx.test1.client, EVENT_KICK, {
    username: "user2"
  }).then((response) => {
    // check the callback value
    expect(response.success).toBe(true);
  });
  await roomListener.then((data) => {
    // update of room trigered
    expect(data).toEqual(getRoom("example")?.asInfo());
  });

  // victim is warned
  await kickListener.then((data) => {
    expect(data).toEqual({ room: "example" });
  });
});
