import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createClient,
  emitAsync,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";
import type { TestServerData } from "./types";
import type { SocketMessageData } from "../types/types";
import { NOT_IN_A_ROOM, NOT_IN_THIS_ROOM } from "../constants/error";

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
  it("wrong room", async () => {
    await joinRoom(ctx.test1, "example2", "user1");
    await emitAsync(ctx.test1.client, "chat", {
      message: "test",
      room: "example"
    }).then(({ success, data }) => {
      expect((data as { room: string }).room).toBe(NOT_IN_THIS_ROOM);
      expect(success).toBe(false);
    });
  });
});

it("valid chat", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const message1 = "c'est un super message!";
  const message2 = "c'est une super réponse!";
  const chatListener1 = onceAsync(ctx.test1.client, "message");
  const chatListener2 = onceAsync(test2.client, "message");

  await joinRoom(ctx.test1, "example", "user1");
  await joinRoom(test2, "example", "user2");

  // users talks
  await emitAsync(ctx.test1.client, "chat", {
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
