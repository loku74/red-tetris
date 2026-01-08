import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emitAsync, fakeUser, setupTestServer, shutdownTestServer } from "./utils";
import { Room } from "../objects/Room";
import { ROOM_MAX_USERS } from "../constants/core";
import { getRoom, setRoom } from "../core/room";
import type { TestServerData } from "./types";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("get rooms", () => {
  it("simple", async () => {
    setRoom("example", new Room("example", fakeUser("id", "example")));

    await emitAsync(ctx.test1.client, "get rooms").then(({ success, data }) => {
      expect(data).toEqual([
        {
          name: "example",
          userCount: 1,
          max: ROOM_MAX_USERS
        }
      ]);
      expect(success).toBe(true);
    });
  });

  it("ignore rooms in game", async () => {
    setRoom("example", new Room("example", fakeUser("id", "example")));
    setRoom("example2", new Room("example2", fakeUser("id2", "example2")));
    getRoom("example2")?.start();

    await emitAsync(ctx.test1.client, "get rooms").then(({ success, data }) => {
      expect(data).toEqual([
        {
          name: "example",
          userCount: 1,
          max: ROOM_MAX_USERS
        }
      ]);
      expect(success).toBe(true);
    });
  });
});
