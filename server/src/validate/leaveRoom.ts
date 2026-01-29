// intern
import { ERROR_INEXISTING_ROOM, ERROR_USER_NOT_FOUND } from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";

// types
import type { Socket } from "socket.io";
import type { Room } from "../objects/Room";
import type { User } from "../objects/User";
import type { ValidateError } from "../types/validate";

type ValidateLeaveRoomSuccess = {
  status: true;
  current: User;
  room: Room;
};

type ValidateLeaveRoomResult = ValidateLeaveRoomSuccess | ValidateError;

export function validateLeaveRoom(socket: Socket): ValidateLeaveRoomResult {
  const current = getUser(socket.id);

  if (current === undefined) {
    return { status: false, error: { room: ERROR_USER_NOT_FOUND } };
  }

  const room = getRoomBySocket(socket);
  if (room === undefined) {
    return { status: false, error: { room: ERROR_INEXISTING_ROOM } };
  }

  return { status: true, room, current };
}
