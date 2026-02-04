// global
import z from "zod";

// intern
import { ERROR_NOT_IN_A_ROOM, ERROR_WARMUP_NOT_IN } from "../constants/validateErrors";
import { actionValidation, formatSchemeError } from "./validation";
import { getUser } from "../core/user";
import { getRoomBySocket } from "../core/room";

// types
import type { EventWarmUpActionPayload, GameActions } from "@app/shared";
import type { ServerSocket } from "../types/socket";
import type { Game } from "../objects/Game";
import type { ValidateError } from "../types/validate";
import type { Player } from "../objects/Player";

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
  payload: EventWarmUpActionPayload
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
    return { status: false, error: { user: ERROR_WARMUP_NOT_IN } };
  }

  const player = current.warmUp.getPlayer(socket.id);

  return { status: true, game: current.warmUp, player: player, action: result.data.action };
}
