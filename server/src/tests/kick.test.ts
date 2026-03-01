import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  EventKickData,
  EventKickError,
  EventKickPayload,
  EventKickSuccess,
  RoomData
} from "@app/shared";
import { EVENT_KICK, EVENT_ROOM_UPDATE } from "@app/shared";

import { setUser } from "@app/core/user";

import type { TestServerData } from "./types";
import {
  createClient,
  emitAsync,
  fakeUser,
  onceAsync,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom
} from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid kick", () => {
  it("not in a room", async () => {
    await emitAsync<EventKickPayload, EventKickSuccess, EventKickError>(
      ctx.socket1.client,
      EVENT_KICK,
      {
        username: "user2"
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("not host", async () => {
    const { room } = await testJoinRoom(ctx.socket1, "example", "user1");

    room.host = fakeUser("dumb", "someone");
    await emitAsync<EventKickPayload, EventKickSuccess, EventKickError>(
      ctx.socket1.client,
      EVENT_KICK,
      {
        username: "user2"
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("him self", async () => {
    await testJoinRoom(ctx.socket1, "example", "user1");
    await emitAsync<EventKickPayload, EventKickSuccess, EventKickError>(
      ctx.socket1.client,
      EVENT_KICK,
      {
        username: "user1"
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("an user not in the room", async () => {
    await testJoinRoom(ctx.socket1, "example", "user1");

    setUser("test", fakeUser("test", "user3"));
    await emitAsync<EventKickPayload, EventKickSuccess, EventKickError>(
      ctx.socket1.client,
      EVENT_KICK,
      {
        username: "user3"
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("same host name, but different rooms", async () => {
    const test2 = await createClient(ctx.address, ctx.io);
    const test3 = await createClient(ctx.address, ctx.io);

    await testJoinRoom(ctx.socket1, "example", "user1");
    await testJoinRoom(test2, "example", "user2");
    await testJoinRoom(test3, "example", "user2");

    // try to usurpate another room with an host
    // with the same name
    await emitAsync<EventKickPayload, EventKickSuccess, EventKickError>(test2.client, EVENT_KICK, {
      username: "test"
    }).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("room already started", async () => {
    const { room } = await testJoinRoom(ctx.socket1, "example", "user1");
    room.start();

    await emitAsync<EventKickPayload, EventKickSuccess, EventKickError>(
      ctx.socket1.client,
      EVENT_KICK,
      {
        username: "user2"
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

it("valid kick", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const kickListener = onceAsync<EventKickData>(test2.client, EVENT_KICK);
  let roomListener: Promise<RoomData>;

  // basic
  roomListener = onceAsync<RoomData>(ctx.socket1.client, EVENT_ROOM_UPDATE);
  await testJoinRoom(ctx.socket1, "example", "user1");
  const { room } = await testJoinRoom(test2, "example", "user2");

  roomListener = onceAsync<RoomData>(ctx.socket1.client, EVENT_ROOM_UPDATE);
  await emitAsync<EventKickPayload, EventKickSuccess, EventKickError>(
    ctx.socket1.client,
    EVENT_KICK,
    {
      username: "user2"
    }
  ).then((response) => {
    // check the callback value
    expect(response.success).toBe(true);
  });
  await roomListener.then((data) => {
    // update of room trigered
    expect(data).toEqual(room.asInfo());
  });

  // victim is warned
  await kickListener.then((data) => {
    expect(data).toEqual({ room: "example" });
  });
});
