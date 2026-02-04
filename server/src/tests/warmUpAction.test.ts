// global
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// intern
import { EVENT_WARMUP_ACTION, EVENT_WARMUP_START, GameActions } from "@app/shared";
import { emitAsync, joinRoom, setupTestServer, shutdownTestServer } from "./utils";
import * as MovementModule from "../core/movements";
import { getUser } from "../core/user";

// types
import type { TestServerData } from "./types";
import type {
  EventWarmUpActionError,
  EventWarmUpActionSuccess,
  EventWarmUpActionPayload
} from "@app/shared";

let ctx: TestServerData;

beforeEach(async () => {
  ctx = await setupTestServer();
});

afterEach(async () => {
  await shutdownTestServer(ctx);
});

it("warm up perform action", async () => {
  const applyMovement = vi.spyOn(MovementModule, "applyMovement");
  const test1 = ctx.test1;
  await joinRoom(test1, "example1", "user1");

  const user = getUser(test1.server.id);
  expect(user).toBeDefined();
  if (!user) return;

  vi.useFakeTimers();

  await emitAsync(test1.client, EVENT_WARMUP_START).then(({ success }) => {
    expect(success).toBe(true);
  });

  // get variables
  const game = user.warmUp;
  expect(game).toBeTruthy();
  if (!game) return;
  const player = game.players.get(user.id);
  expect(player).toBeDefined();
  if (!player) return;

  // make on fall tick
  await vi.advanceTimersToNextTimerAsync();
  expect(game.ongoing).toBe(true);

  const pieceBeforeY = player.actualPiece.y;

  // perform simple action
  await emitAsync<EventWarmUpActionSuccess, EventWarmUpActionError, EventWarmUpActionPayload>(
    test1.client,
    EVENT_WARMUP_ACTION,
    { action: GameActions.RIGHT }
  ).then((response) => {
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(game.getGameInfo(test1.server.id));
    }
  });
  expect(player.actualPiece.y).toBeGreaterThan(pieceBeforeY);
  expect(applyMovement).toBeCalledTimes(1);
  expect(applyMovement).toBeCalledWith(game, player, "RIGHT");
});
