// intern
import { ERROR_NOT_IN_A_ROOM, ERROR_PLAYING_ROOM } from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";
import z from "zod";
import { formatSchemeError, tickValidation } from "./validation";

// types
import type { User } from "../objects/User";
import type { ValidateError } from "../types/validate";
import type { ServerSocket } from "../types/socket";
import type { EventWarmUpPayload, GameSettings } from "@app/shared";

const schema = z.object({
  tick: tickValidation
});

type ValidateWarmUpSuccess = {
  status: true;
  current: User;
  GameSettings: GameSettings;
};

type ValidateWarmUpResult = ValidateWarmUpSuccess | ValidateError;

export function validateWarmUp(
  socket: ServerSocket,
  payload: EventWarmUpPayload
): ValidateWarmUpResult {
  const result = schema.safeParse(payload);

  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (current === undefined || room === undefined) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }
  if (room.game) {
    return { status: false, error: { room: ERROR_PLAYING_ROOM } };
  }
  const GameSettings: GameSettings = {
    tick: result.data.tick
  };

  return { status: true, current: current, GameSettings: GameSettings };
}
