import z from "zod";

import type { EventGameActionPayload, GameActions } from "@app/shared";

import { ERROR_NOT_IN_A_ROOM, ERROR_NOT_IN_WARMUP } from "@app/constants/validateErrors";
import { getRoomBySocket } from "@app/core/room";
import { getUser } from "@app/core/user";
import type { Game } from "@app/objects/Game";
import type { Player } from "@app/objects/Player";
import type { ServerSocket } from "@app/types/socket";
import type { ValidateError } from "@app/types/validate";

import { actionValidation, formatSchemeError } from "./validation";

const schema = z.object({
  action: actionValidation
});

type ValidateWarmUpActionSuccess = {
  status: true;
  game: Game;
  player: Player;
  action: GameActions;
};

type ValidateWarmUpActionResult = ValidateWarmUpActionSuccess | ValidateError;

export function validateWarmUpAction(
  socket: ServerSocket,
  payload: EventGameActionPayload
): ValidateWarmUpActionResult {
  const result = schema.safeParse(payload);

  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (!current || !room) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }

  if (!current.warmUp || !current.warmUp.ongoing) {
    return { status: false, error: { username: ERROR_NOT_IN_WARMUP } };
  }

  const player = current.warmUp.getPlayer(socket.id);

  return { status: true, game: current.warmUp, player: player, action: result.data.action };
}
