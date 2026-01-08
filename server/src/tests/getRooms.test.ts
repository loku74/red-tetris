import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ROOM_MAX_USERS } from "../constants/core";
import { Room, rooms } from "../objects/Room";
import { User } from "../objects/User";
import type { TestServerData } from "./types";
import { emitAsync, setupTestServer, shutdownTestServer } from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("get rooms", () => {
  it("simple", async () => {
    rooms.set("example", new Room("example", new User("id", "example", null)));

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
    rooms.set("example", new Room("example", new User("id", "example", null)));
    rooms.set("example2", new Room("example2", new User("id2", "example2", null)));
    rooms.get("example2")?.start();

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
