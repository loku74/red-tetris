// intern
import { ERROR_NOT_IN_A_ROOM, ERROR_PLAYING_ROOM } from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";

// types
import type { User } from "../objects/User";
import type { ValidateError } from "../types/validate";
import type { ServerSocket } from "../types/socket";

type ValidateWarmUpSuccess = {
  status: true;
  current: User;
};

type ValidateWarmUpResult = ValidateWarmUpSuccess | ValidateError;

export function validateWarmUp(socket: ServerSocket): ValidateWarmUpResult {
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (current === undefined || room === undefined) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }
  if (room.playing) {
    return { status: false, error: { room: ERROR_PLAYING_ROOM } };
  }

  return { status: true, current: current };
}
