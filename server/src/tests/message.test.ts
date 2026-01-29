// global
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// intern
import { EVENT_MESSAGE } from "@app/shared";
import { ERROR_NOT_IN_A_ROOM } from "../constants/validateErrors";
import {
  createClient,
  emitAsync,
  joinRoom,
  onceAsync,
  setupTestServer,
  shutdownTestServer
} from "./utils";

// types
import type { EventMessageData, EventMessageError } from "@app/shared";
import type { TestServerData } from "./types";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid chat", () => {
  it("not in a room", async () => {
    await emitAsync<unknown, EventMessageError>(ctx.test1.client, EVENT_MESSAGE, {
      message: "test"
    }).then((response) => {
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.room).toBe(ERROR_NOT_IN_A_ROOM);
      }
    });
  });
});

it("valid chat", async () => {
  const test2 = await createClient(ctx.address, ctx.io);
  const message = "c'est un super message!";
  const chatListener1 = onceAsync<EventMessageData>(ctx.test1.client, "message");
  const chatListener2 = onceAsync<EventMessageData>(test2.client, "message");

  await joinRoom(ctx.test1, "example", "user1");
  await joinRoom(test2, "example", "user2");

  // users talks
  await emitAsync(ctx.test1.client, EVENT_MESSAGE, {
    message: message
  }).then((response) => {
    expect(response.success).toBe(true);
  });

  // check results
  const data2 = await chatListener2;
  expect(data2.from).toEqual("user1");
  expect(data2.message).toEqual(message);

  const data1 = await chatListener1;
  expect(data1.from).toEqual("user1");
  expect(data1.message).toEqual(message);
});
