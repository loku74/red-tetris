import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  EventSpectateError,
  EventSpectatePayload,
  EventSpectateSuccess,
  GameData
} from "@app/shared";
import {
  EVENT_GAME_INFO,
  EVENT_GAME_RESET_SPECTATE,
  EVENT_GAME_SPECTATE,
  USERNAME_MAX_LENGTH
} from "@app/shared";

import type { TestServerData } from "./types";
import {
  emitAsync,
  onceAsync,
  passGameCountdown,
  setupTestServer,
  shutdownTestServer,
  testJoinRoom,
  testStartGame
} from "./utils";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
  vi.useFakeTimers();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("invalid spectate", () => {
  it("invalid schemas", async () => {
    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "" }
    ).then((response) => {
      expect(response.success).toBe(false);
    });

    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "a".repeat(USERNAME_MAX_LENGTH + 1) }
    ).then((response) => {
      expect(response.success).toBe(false);
    });

    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "/" }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("not in a room", async () => {
    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "test" }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("not in a game", async () => {
    await testJoinRoom(ctx.socket1, "room", "test");
    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "test" }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("not dead", async () => {
    await testJoinRoom(ctx.socket1, "room", "test");
    await testJoinRoom(ctx.socket2, "room", "test2");

    await testStartGame(ctx.socket1);
    await passGameCountdown();

    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "test" }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("not a existing user in the room", async () => {
    await testJoinRoom(ctx.socket1, "room", "test");
    await testJoinRoom(ctx.socket2, "room", "test2");
    await testJoinRoom(ctx.socket3, "room2", "test3");

    const { player } = await testStartGame(ctx.socket1);
    await passGameCountdown();
    player.alive = false;

    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "test3" }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });

  it("a dead player", async () => {
    await testJoinRoom(ctx.socket1, "room", "test");
    await testJoinRoom(ctx.socket2, "room", "test2");
    await testJoinRoom(ctx.socket3, "room", "test3");

    const { player, game } = await testStartGame(ctx.socket1);
    const player2 = game.getPlayer(ctx.socket2.server.id);
    await passGameCountdown();
    player.alive = false;
    player2.alive = false;

    await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
      ctx.socket1.client,
      EVENT_GAME_SPECTATE,
      { username: "test2" }
    ).then((response) => {
      expect(response.success).toBe(false);
    });
  });
});

it("a good spectate", async () => {
  await testJoinRoom(ctx.socket1, "room", "test");
  await testJoinRoom(ctx.socket2, "room", "test2");
  await testJoinRoom(ctx.socket3, "room", "test3");

  const { player, game } = await testStartGame(ctx.socket1);
  await passGameCountdown();
  player.alive = false;

  await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
    ctx.socket1.client,
    EVENT_GAME_SPECTATE,
    { username: "test2" }
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  const listener = onceAsync<GameData>(ctx.socket1.client, EVENT_GAME_INFO);

  await vi.advanceTimersToNextTimerAsync();
  await listener.then((data) => {
    expect(data).toStrictEqual(game.getGameInfo(ctx.socket2.server.id));
  });
});

it("changing spectate", async () => {
  await testJoinRoom(ctx.socket1, "room", "test");
  await testJoinRoom(ctx.socket2, "room", "test2");
  await testJoinRoom(ctx.socket3, "room", "test3");
  await testJoinRoom(ctx.socket4, "room", "test4");

  const { player, game } = await testStartGame(ctx.socket1);
  await passGameCountdown();
  player.alive = false;

  await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
    ctx.socket1.client,
    EVENT_GAME_SPECTATE,
    { username: "test2" }
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  const listener = onceAsync<GameData>(ctx.socket1.client, EVENT_GAME_INFO);
  await vi.advanceTimersToNextTimerAsync();
  await listener.then((data) => {
    expect(data).toStrictEqual(game.getGameInfo(ctx.socket2.server.id));
  });

  // now changing spectate
  await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
    ctx.socket1.client,
    EVENT_GAME_SPECTATE,
    { username: "test3" }
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  const listener2 = onceAsync<GameData>(ctx.socket1.client, EVENT_GAME_INFO);
  await vi.advanceTimersToNextTimerAsync();
  await listener2.then((data) => {
    expect(data).toStrictEqual(game.getGameInfo(ctx.socket3.server.id));
  });
});

it("resetting a spectate", async () => {
  await testJoinRoom(ctx.socket1, "room", "test");
  await testJoinRoom(ctx.socket2, "room", "test2");
  await testJoinRoom(ctx.socket3, "room", "test3");
  await testJoinRoom(ctx.socket4, "room", "test4");

  const { player, game } = await testStartGame(ctx.socket1);
  const spectatedPlayer = game.getPlayer(ctx.socket2.server.id);
  await passGameCountdown();
  player.alive = false;

  await emitAsync<EventSpectatePayload, EventSpectateError, EventSpectateSuccess>(
    ctx.socket1.client,
    EVENT_GAME_SPECTATE,
    { username: "test2" }
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  const listener = onceAsync<GameData>(ctx.socket1.client, EVENT_GAME_INFO);
  await vi.advanceTimersToNextTimerAsync();
  await listener.then((data) => {
    expect(data).toStrictEqual(game.getGameInfo(ctx.socket2.server.id));
  });

  // check actual values
  expect(player.spectating).toBe(spectatedPlayer);
  expect(spectatedPlayer.spectators.has(player)).toBeTruthy();

  // stop the spectate
  await emitAsync<undefined, undefined, undefined>(
    ctx.socket1.client,
    EVENT_GAME_RESET_SPECTATE
  ).then((response) => {
    expect(response.success).toBe(true);
  });

  expect(player.spectating).toBeNull();
  expect(!spectatedPlayer.spectators.has(player)).toBeTruthy();
});
