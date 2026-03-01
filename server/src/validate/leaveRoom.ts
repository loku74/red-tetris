import { ERROR_NOT_IN_A_ROOM, ERROR_USER_NOT_FOUND } from "@app/constants/validateErrors";
import { getRoomBySocket } from "@app/core/room";
import { getUser } from "@app/core/user";
import type { Room } from "@app/objects/Room";
import type { User } from "@app/objects/User";
import type { ServerSocket } from "@app/types/socket";
import type { ValidateError } from "@app/types/validate";

type ValidateLeaveRoomSuccess = {
  status: true;
  current: User;
  room: Room;
};

type ValidateLeaveRoomResult = ValidateLeaveRoomSuccess | ValidateError;

export function validateLeaveRoom(socket: ServerSocket): ValidateLeaveRoomResult {
  const current = getUser(socket.id);

  if (current === undefined) {
    return { status: false, error: { room: ERROR_USER_NOT_FOUND } };
  }

  const room = getRoomBySocket(socket);
  if (room === undefined) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }

  return { status: true, room, current };
}
