import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  EventMessageData,
  EventMessageError,
  EventMessagePayload,
  EventMessageSuccess
} from "@app/shared";
import { EVENT_MESSAGE, MESSAGE_MAX_LENGTH } from "@app/shared";

import type { TestServerData } from "./types";
import {
  createClient,
  emitAsync,
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

describe("invalid chat", () => {
  it("not in a room", async () => {
    await emitAsync<EventMessagePayload, EventMessageError, EventMessageSuccess>(
      ctx.test1.client,
      EVENT_MESSAGE,
      {
        message: "test"
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("empty message", async () => {
    await testJoinRoom(ctx.test1, "test", "test");
    const message = "";

    await emitAsync<EventMessagePayload, EventMessageError, EventMessageSuccess>(
      ctx.test1.client,
      EVENT_MESSAGE,
      {
        message: message
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("blank message", async () => {
    await testJoinRoom(ctx.test1, "test", "test");
    const message = "      ";

    await emitAsync<EventMessagePayload, EventMessageError, EventMessageSuccess>(
      ctx.test1.client,
      EVENT_MESSAGE,
      {
        message: message
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("message too long", async () => {
    await testJoinRoom(ctx.test1, "test", "test");
    const message = "a".repeat(MESSAGE_MAX_LENGTH + 1);

    await emitAsync<EventMessagePayload, EventMessageError, EventMessageSuccess>(
      ctx.test1.client,
      EVENT_MESSAGE,
      {
        message: message
      }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

describe("valid chat", () => {
  it("conversation", async () => {
    const test2 = await createClient(ctx.address, ctx.io);
    const message = "c'est un super message!";
    const chatListener1 = onceAsync<EventMessageData>(ctx.test1.client, "message");
    const chatListener2 = onceAsync<EventMessageData>(test2.client, "message");

    await testJoinRoom(ctx.test1, "example", "user1");
    await testJoinRoom(test2, "example", "user2");

    // users talks
    await emitAsync<EventMessagePayload, EventMessageError, EventMessageSuccess>(
      ctx.test1.client,
      EVENT_MESSAGE,
      {
        message: message
      }
    ).then((response) => {
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
});
