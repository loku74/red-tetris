import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  EVENT_CHANGE_COLOR,
  EVENT_ROOM_UPDATE,
  type EventChangeColorError,
  type EventChangeColorPayload,
  type EventChangeColorSuccess,
  getAllUserColors,
  PieceColor,
  type RoomData,
  type UserColor
} from "@app/shared";

import {
  ERROR_COLOR_UNAVAILABLE,
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM
} from "@app/constants/validateErrors";

import type { TestServerData } from "./types";
import {
  emitAsync,
  onceAsync,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom,
  testStartGame
} from "./utils";

let ctx: TestServerData;
const testRoomName = "test";
const testUserName1 = "test1";
const testUserName2 = "test2";

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

describe("invalid change color", () => {
  it("not in a room", async () => {
    const payload: EventChangeColorPayload = { color: PieceColor.RED };

    const response = await emitAsync<
      EventChangeColorPayload,
      EventChangeColorSuccess,
      EventChangeColorError
    >(ctx.socket1.client, EVENT_CHANGE_COLOR, payload);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error.room).toBe(ERROR_NOT_IN_A_ROOM);
    }
  });

  it("playing room", async () => {
    await testJoinRoom(ctx.socket1, testRoomName, testUserName1);
    await testJoinRoom(ctx.socket2, testRoomName, testUserName2);
    await testStartGame(ctx.socket1);

    const payload: EventChangeColorPayload = { color: PieceColor.RED };

    const response = await emitAsync<
      EventChangeColorPayload,
      EventChangeColorSuccess,
      EventChangeColorError
    >(ctx.socket1.client, EVENT_CHANGE_COLOR, payload);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error.room).toBe(ERROR_PLAYING_ROOM);
    }
  });

  it("already taken color", async () => {
    await testJoinRoom(ctx.socket1, testRoomName, testUserName1);
    const userData2 = await testJoinRoom(ctx.socket2, testRoomName, testUserName2);

    const payload: EventChangeColorPayload = { color: userData2.user.color };

    const response = await emitAsync<
      EventChangeColorPayload,
      EventChangeColorSuccess,
      EventChangeColorError
    >(ctx.socket1.client, EVENT_CHANGE_COLOR, payload);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error.room).toBe(ERROR_COLOR_UNAVAILABLE);
    }
  });

  it("invalid color", async () => {
    await testJoinRoom(ctx.socket1, testRoomName, testUserName1);

    const payload: EventChangeColorPayload = { color: 42 as UserColor };

    const response = await emitAsync<
      EventChangeColorPayload,
      EventChangeColorSuccess,
      EventChangeColorError
    >(ctx.socket1.client, EVENT_CHANGE_COLOR, payload);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error.room).toBe(ERROR_COLOR_UNAVAILABLE);
    }
  });
});

it("all valid colors", async () => {
  const data = await testJoinRoom(ctx.socket1, testRoomName, testUserName1);
  const savedColor = data.user.color;

  const allColors = getAllUserColors().filter((color) => color !== savedColor);
  allColors.push(savedColor);

  for (const color of allColors) {
    const payload: EventChangeColorPayload = { color };
    const roomListener = onceAsync<RoomData>(ctx.socket1.client, EVENT_ROOM_UPDATE);

    const response = await emitAsync<
      EventChangeColorPayload,
      EventChangeColorSuccess,
      EventChangeColorError
    >(ctx.socket1.client, EVENT_CHANGE_COLOR, payload);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.color).toBe(color);
    }

    const roomData = await roomListener;
    expect(roomData.players[0]).toStrictEqual({ username: data.user.name, color: color });
  }
});
