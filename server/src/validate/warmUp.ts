import { DEFAULT_GAME_SETTINGS, type GameSettings } from "@app/shared";

import { ERROR_NOT_IN_A_ROOM, ERROR_PLAYING_ROOM } from "@app/constants/validateErrors";
import { getRoomBySocket } from "@app/core/room";
import { getUser } from "@app/core/user";
import type { User } from "@app/objects/User";
import type { ServerSocket } from "@app/types/socket";
import type { ValidateError } from "@app/types/validate";

type ValidateWarmUpSuccess = {
  status: true;
  current: User;
  settings: GameSettings;
};

type ValidateWarmUpResult = ValidateWarmUpSuccess | ValidateError;

export function validateWarmUp(socket: ServerSocket): ValidateWarmUpResult {
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (current === undefined || room === undefined) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }
  if (room.game) {
    return { status: false, error: { room: ERROR_PLAYING_ROOM } };
  }

  return { status: true, current: current, settings: DEFAULT_GAME_SETTINGS };
}
