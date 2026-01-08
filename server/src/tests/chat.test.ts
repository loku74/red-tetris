import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NOT_IN_A_ROOM } from "../constants/validateErrors";
import type { SocketMessageResponse } from "../types/types";
import type { TestServerData } from "./types";
import {
  createClient,
  emitAsync,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid chat", () => {
  it("not in a room", async () => {
    await emitAsync(ctx.test1.client, "chat", {
      message: "test",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(NOT_IN_A_ROOM);
      expect(success).toBe(false);
    });
  });
});

it("valid chat", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const message = "c'est un super message!";
  const chatListener1 = onceAsync(ctx.test1.client, "message");
  const chatListener2 = onceAsync(test2.client, "message");

  await joinRoom(ctx.test1, "example", "user1");
  await joinRoom(test2, "example", "user2");

  // users talks
  await emitAsync(ctx.test1.client, "chat", {
    message: message,
    room: "example"
  }).then(({ success }) => {
    expect(success).toBe(true);
  });

  // check results
  const data2 = (await chatListener2) as SocketMessageResponse;
  expect(data2.from).toEqual("user1");
  expect(data2.message).toEqual(message);

  const data1 = (await chatListener1) as SocketMessageResponse;
  expect(data1.from).toEqual("user1");
  expect(data1.message).toEqual(message);
});
